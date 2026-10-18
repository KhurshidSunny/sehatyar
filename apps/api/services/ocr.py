"""Medicine pack image OCR with light Pillow preprocessing."""

from __future__ import annotations

import io
from functools import lru_cache

import pytesseract
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from pytesseract import TesseractNotFoundError

from config import get_settings

# Keep memory bounded for phone uploads.
_MAX_EDGE_PX = 1600
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


@lru_cache
def _configure_tesseract() -> None:
    settings = get_settings()
    if settings.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def _preprocess(image: Image.Image) -> Image.Image:
    """Convert to a high-contrast grayscale image suitable for pack text."""
    rgb = image.convert("RGB")
    gray = ImageOps.grayscale(rgb)
    gray = ImageOps.autocontrast(gray)
    # Cap huge phone photos so OCR stays reasonably fast.
    gray.thumbnail((_MAX_EDGE_PX, _MAX_EDGE_PX), Image.Resampling.LANCZOS)
    gray = gray.filter(ImageFilter.SHARPEN)
    gray = ImageEnhance.Contrast(gray).enhance(1.4)
    return gray


def extract_text_from_image_bytes(
    data: bytes,
    *,
    content_type: str | None = None,
) -> str:
    """Return cleaned OCR text from an uploaded medicine pack image."""
    if not data:
        raise OcrError("Empty image upload")

    ctype = (content_type or "").split(";")[0].strip().lower()
    if ctype and ctype not in _ALLOWED_CONTENT_TYPES:
        raise OcrError(f"Unsupported image type: {ctype}")

    _configure_tesseract()

    try:
        with Image.open(io.BytesIO(data)) as raw:
            processed = _preprocess(raw)
    except OSError as exc:
        raise OcrError("Could not read image file") from exc

    try:
        text = pytesseract.image_to_string(processed, lang="eng")
    except TesseractNotFoundError as exc:
        raise OcrError(
            "Tesseract is not installed or TESSERACT_CMD is wrong"
        ) from exc
    except pytesseract.TesseractError as exc:
        raise OcrError(f"OCR failed: {exc}") from exc

    cleaned = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    return cleaned
