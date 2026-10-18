"""Medicine pack image OCR with Pillow + OpenCV preprocessing."""

from __future__ import annotations

import io
import re
from dataclasses import dataclass
from functools import lru_cache

import pytesseract
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from pytesseract import TesseractNotFoundError

from config import get_settings

try:
    import cv2
    import numpy as np

    _HAS_OPENCV = True
except ImportError:  # pragma: no cover - optional dependency
    cv2 = None  # type: ignore[assignment]
    np = None  # type: ignore[assignment]
    _HAS_OPENCV = False

# Keep memory bounded for phone uploads.
_MAX_EDGE_PX = 2000
_MIN_EDGE_PX = 1000
# Reject faces / blank walls: need enough readable Latin letters.
_MIN_LETTER_COUNT = 10
_ALLOWED_CONTENT_TYPES = frozenset(
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/octet-stream",
    }
)


class OcrError(Exception):
    """Raised when the image cannot be read or Tesseract is unavailable."""


@dataclass(frozen=True)
class OcrExtract:
    """OCR output plus quality signals used to reject non-pack photos."""

    text: str
    letter_count: int
    mean_confidence: float
    usable: bool


@lru_cache
def _configure_tesseract() -> None:
    settings = get_settings()
    if settings.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def _letter_count(text: str) -> int:
    return sum(1 for ch in text if ch.isalpha())


def _clean_text(text: str) -> str:
    return "\n".join(line.strip() for line in text.splitlines() if line.strip())


def _resize_gray(gray: Image.Image) -> Image.Image:
    w, h = gray.size
    longest = max(w, h)
    if longest < _MIN_EDGE_PX:
        scale = _MIN_EDGE_PX / float(longest)
        return gray.resize(
            (max(1, int(w * scale)), max(1, int(h * scale))),
            Image.Resampling.LANCZOS,
        )
    gray.thumbnail((_MAX_EDGE_PX, _MAX_EDGE_PX), Image.Resampling.LANCZOS)
    return gray


def _opencv_variants(gray: Image.Image) -> list[Image.Image]:
    """Adaptive threshold / denoise views — better on phone pack photos."""
    if not _HAS_OPENCV:
        return []
    arr = np.array(gray)
    denoise = cv2.fastNlMeansDenoising(arr, None, 10, 7, 21)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(denoise)
    adaptive = cv2.adaptiveThreshold(
        clahe,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )
    _, otsu = cv2.threshold(clahe, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return [
        Image.fromarray(clahe),
        Image.fromarray(adaptive),
        Image.fromarray(otsu),
    ]


def _preprocess_variants(image: Image.Image) -> list[Image.Image]:
    """Build preprocessed views; pack photos vary a lot in lighting."""
    rgb = image.convert("RGB")
    gray = _resize_gray(ImageOps.autocontrast(ImageOps.grayscale(rgb)))
    sharp = gray.filter(ImageFilter.UnsharpMask(radius=1.5, percent=160, threshold=3))
    contrast = ImageEnhance.Contrast(sharp).enhance(1.75)
    bright = ImageEnhance.Brightness(contrast).enhance(1.05)
    binary = contrast.point(lambda p: 255 if p > 150 else 0)
    variants = [bright, contrast, binary, sharp]
    variants.extend(_opencv_variants(gray))
    return variants


def _word_confidences(image: Image.Image, config: str) -> list[float]:
    """Tesseract per-word confidences for alphabetic tokens (0–100)."""
    data = pytesseract.image_to_data(
        image,
        lang="eng",
        config=config,
        output_type=pytesseract.Output.DICT,
    )
    confs: list[float] = []
    for text, conf in zip(data.get("text", []), data.get("conf", []), strict=False):
        token = (text or "").strip()
        if not token or not any(ch.isalpha() for ch in token):
            continue
        try:
            value = float(conf)
        except (TypeError, ValueError):
            continue
        if value >= 0:
            confs.append(value)
    return confs


def _vowel_rich_words(text: str) -> list[str]:
    """Latin words that look pronounceable (pack labels), not face gibberish."""
    words = re.findall(r"[A-Za-z]{4,}", text)
    return [w for w in words if re.search(r"[aeiouAEIOU]", w)]


def _vowel_ratio(text: str) -> float:
    letters = [ch.casefold() for ch in text if ch.isalpha() and ch.isascii()]
    if len(letters) < 8:
        return 0.0
    return sum(1 for ch in letters if ch in "aeiou") / len(letters)


def _looks_like_pack_text(
    text: str,
    mean_confidence: float,
    max_confidence: float,
) -> bool:
    """True only when OCR looks like a label, not a face / blank scene."""
    letters = _letter_count(text)
    words = re.findall(r"[A-Za-z]{4,}", text)
    vowel_words = _vowel_rich_words(text)
    if letters < _MIN_LETTER_COUNT or len(vowel_words) < 2:
        return False

    # Face / texture OCR often yields many short consonant clusters.
    if len(vowel_words) < max(2, (len(words) + 1) // 2):
        return False

    ratio = _vowel_ratio(text)
    if ratio < 0.24 or ratio > 0.56:
        return False

    long_words = [w for w in vowel_words if len(w) >= 6]
    # Strong printed text confidence.
    if max_confidence >= 70 and letters >= 10 and long_words:
        return True
    # Solid average confidence with several real-looking words.
    if mean_confidence >= 55 and len(vowel_words) >= 3 and letters >= 14:
        return True
    # Weaker OCR but clearly structured multi-word label text.
    if len(long_words) >= 2 and letters >= 16 and mean_confidence >= 42:
        return True
    return False


def extract_text_from_image_bytes(
    data: bytes,
    *,
    content_type: str | None = None,
) -> OcrExtract:
    """Return OCR text and whether it looks like a readable medicine label."""
    if not data:
        raise OcrError("Empty image upload")

    ctype = (content_type or "").split(";")[0].strip().lower()
    if ctype and ctype not in _ALLOWED_CONTENT_TYPES:
        raise OcrError(f"Unsupported image type: {ctype}")

    _configure_tesseract()

    try:
        with Image.open(io.BytesIO(data)) as raw:
            oriented = ImageOps.exif_transpose(raw)
            variants = _preprocess_variants(oriented)
    except OSError as exc:
        raise OcrError("Could not read image file") from exc

    # Prefer sparse page modes + a whitelist pass for printed pack Latin text.
    configs = (
        "--oem 3 --psm 6",
        "--oem 3 --psm 11",
        "--oem 3 --psm 4",
        "-c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-./% --oem 3 --psm 6",
    )

    best_text = ""
    best_letters = -1
    best_mean = 0.0
    best_max = 0.0
    best_score = -1.0

    try:
        for variant in variants:
            for config in configs:
                text = _clean_text(
                    pytesseract.image_to_string(
                        variant,
                        lang="eng",
                        config=config,
                    )
                )
                letters = _letter_count(text)
                if letters < 4:
                    continue
                confs = _word_confidences(variant, config)
                mean_conf = sum(confs) / len(confs) if confs else 0.0
                max_conf = max(confs) if confs else 0.0
                vowel_words = len(_vowel_rich_words(text))
                # Prefer confident, pronounceable text over long gibberish.
                score = mean_conf * 2.0 + max_conf + vowel_words * 8.0 + min(letters, 40) * 0.5
                if score > best_score or (
                    score == best_score and letters > best_letters
                ):
                    best_score = score
                    best_letters = letters
                    best_text = text
                    best_mean = mean_conf
                    best_max = max_conf
    except TesseractNotFoundError as exc:
        raise OcrError(
            "Tesseract is not installed or TESSERACT_CMD is wrong"
        ) from exc
    except pytesseract.TesseractError as exc:
        raise OcrError(f"OCR failed: {exc}") from exc

    usable = _looks_like_pack_text(best_text, best_mean, best_max)
    # Faces / walls often yield random characters — do not keep that noise.
    text_out = best_text if usable else ""
    return OcrExtract(
        text=text_out,
        letter_count=max(0, best_letters) if usable else 0,
        mean_confidence=round(best_mean, 1) if usable else 0.0,
        usable=usable,
    )
