"""Seed MongoDB with the curated FAQ and medicine JSON under data/.

Run from apps/api so .env and the relative data paths resolve:

    python -m scripts.seed            # upsert all content
    python -m scripts.seed --dry-run  # validate JSON only, no database writes
    python -m scripts.seed --prune    # also delete documents no longer in JSON
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from collections.abc import Sequence

from pydantic import BaseModel
from pymongo import ASCENDING, ReplaceOne

from db import close_db, get_db, ping_db
from services import faq_store, medicine_store

FAQ_CATEGORIES = "faq_categories"
FAQS = "faqs"
MEDICINE_CATEGORIES = "medicine_categories"
MEDICINES = "medicines"

INDEXES: dict[str, list[str]] = {
    FAQ_CATEGORIES: ["order"],
    FAQS: ["category"],
    MEDICINE_CATEGORIES: ["order"],
    MEDICINES: ["category", "names"],
}


def _to_document(model: BaseModel) -> dict:
    # mode="json" stores lastReviewed as an ISO string; BSON has no date-only type.
    document = model.model_dump(mode="json")
    document["_id"] = document["id"]
    return document


def load_content() -> dict[str, list[BaseModel]]:
    """Read and validate every curated file; raises on schema or reference errors."""
    faq_store.clear_cache()
    medicine_store.clear_cache()
    return {
        FAQ_CATEGORIES: list(faq_store.list_categories()),
        FAQS: list(faq_store.list_faqs()),
        MEDICINE_CATEGORIES: list(medicine_store.list_categories()),
        MEDICINES: list(medicine_store.list_medicines()),
    }


async def _seed_collection(
    name: str,
    models: Sequence[BaseModel],
    *,
    prune: bool,
) -> tuple[int, int, int]:
    collection = get_db()[name]
    documents = [_to_document(model) for model in models]

    upserted = modified = 0
    if documents:
        result = await collection.bulk_write(
            [ReplaceOne({"_id": doc["_id"]}, doc, upsert=True) for doc in documents],
            ordered=False,
        )
        upserted = result.upserted_count
        modified = result.modified_count

    pruned = 0
    if prune:
        ids = [doc["_id"] for doc in documents]
        pruned = (await collection.delete_many({"_id": {"$nin": ids}})).deleted_count

    for field in INDEXES.get(name, []):
        await collection.create_index([(field, ASCENDING)])

    return upserted, modified, pruned


async def seed(content: dict[str, list[BaseModel]], *, prune: bool) -> None:
    await ping_db()
    print(f"Seeding database {get_db().name!r}")
    for name, models in content.items():
        upserted, modified, pruned = await _seed_collection(name, models, prune=prune)
        line = (
            f"  {name:<20} {len(models):>3} docs "
            f"(inserted {upserted}, updated {modified}"
        )
        if prune:
            line += f", removed {pruned}"
        print(line + ")")


def _parse_args(argv: Sequence[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Load curated FAQ and medicine JSON into MongoDB.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="validate the JSON files and print counts without writing",
    )
    parser.add_argument(
        "--prune",
        action="store_true",
        help="delete documents whose id is no longer present in the JSON files",
    )
    return parser.parse_args(argv)


async def _run(content: dict[str, list[BaseModel]], *, prune: bool) -> None:
    try:
        await seed(content, prune=prune)
    finally:
        await close_db()


def main(argv: Sequence[str] | None = None) -> int:
    args = _parse_args(argv)

    try:
        content = load_content()
    except (FileNotFoundError, ValueError) as exc:
        print(f"Content validation failed: {exc}", file=sys.stderr)
        return 1

    if args.dry_run:
        for name, models in content.items():
            print(f"  {name:<20} {len(models):>3} docs")
        print("Dry run: no database writes.")
        return 0

    try:
        asyncio.run(_run(content, prune=args.prune))
    except Exception as exc:  # noqa: BLE001 — report connection/write errors cleanly
        print(f"Seeding failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
