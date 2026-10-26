"""Rebuild apps/web/public/offline/top-faqs.json with ALL curated FAQs + audio URLs."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FAQ_DIR = ROOT / "data" / "faqs"
OUT = ROOT / "apps" / "web" / "public" / "offline" / "top-faqs.json"


def main() -> None:
    categories = json.loads((FAQ_DIR / "categories.json").read_text(encoding="utf-8"))
    categories = sorted(categories, key=lambda c: c["order"])
    faqs: list[dict] = []
    for path in sorted(FAQ_DIR.glob("*.json")):
        if path.name == "categories.json":
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload, list):
            faqs.extend(payload)
    faqs.sort(key=lambda f: (f.get("category", ""), f.get("id", "")))
    audio_urls = sorted(
        {
            url
            for faq in faqs
            if isinstance((url := faq.get("audioUrl")), str) and url.strip()
        }
    )
    pack = {
        "version": 2,
        "generatedFrom": "data/faqs",
        "categories": categories,
        "faqs": faqs,
        "audioUrls": audio_urls,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT}")
    print(f"faqs={len(faqs)} audioUrls={len(audio_urls)} categories={len(categories)}")


if __name__ == "__main__":
    main()
