"""Add forms[] to every medicine JSON (idempotent)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data" / "medicines"

# Common household forms for each catalog id.
FORMS: dict[str, list[str]] = {
    "med-cetirizine": ["tablet", "syrup", "drops"],
    "med-loratadine": ["tablet", "syrup"],
    "med-chlorpheniramine": ["tablet", "syrup"],
    "med-salbutamol": ["inhaler", "syrup", "tablet"],
    "med-dextromethorphan": ["syrup", "tablet"],
    "med-amoxicillin": ["capsule", "tablet", "syrup"],
    "med-azithromycin": ["tablet", "capsule", "syrup"],
    "med-metronidazole": ["tablet", "syrup", "injection"],
    "med-ciprofloxacin": ["tablet", "drops", "injection"],
    "med-cotrimoxazole": ["tablet", "syrup"],
    "med-doxycycline": ["capsule", "tablet"],
    "med-albendazole": ["tablet", "syrup"],
    "med-mebendazole": ["tablet", "syrup"],
    "med-metformin": ["tablet"],
    "med-amlodipine": ["tablet"],
    "med-atorvastatin": ["tablet"],
    "med-oral-contraceptive": ["tablet"],
    "med-insulin": ["injection"],
    "med-paracetamol": ["tablet", "syrup", "drops"],
    "med-ibuprofen": ["tablet", "syrup", "capsule"],
    "med-aspirin": ["tablet"],
    "med-diclofenac": ["tablet", "cream", "injection"],
    "med-mefenamic-acid": ["tablet", "capsule"],
    "med-naproxen": ["tablet"],
    "med-ors": ["powder", "other"],
    "med-zinc-sulfate": ["tablet", "syrup", "drops"],
    "med-electrolyte-solution": ["syrup", "other"],
    "med-omeprazole": ["capsule", "tablet"],
    "med-famotidine": ["tablet"],
    "med-antacid": ["tablet", "syrup", "other"],
    "med-loperamide": ["tablet", "capsule"],
    "med-domperidone": ["tablet", "syrup"],
    "med-povidone-iodine": ["cream", "other"],
    "med-clotrimazole": ["cream"],
    "med-hydrocortisone-cream": ["cream"],
    "med-tetracycline-eye-ointment": ["cream", "drops"],
    "med-hydrogen-peroxide": ["other"],
    "med-multivitamin": ["tablet", "syrup", "drops"],
    "med-ferrous-sulfate": ["tablet", "syrup", "drops"],
    "med-folic-acid": ["tablet"],
    "med-vitamin-d": ["drops", "tablet", "capsule"],
    "med-calcium": ["tablet"],
}


def main() -> None:
    missing: list[str] = []
    skip = {"categories.json", "forms.json"}
    for path in sorted(ROOT.glob("*.json")):
        if path.name in skip:
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            continue
        changed = False
        for item in data:
            if not isinstance(item, dict) or "names" not in item:
                continue
            mid = item["id"]
            forms = FORMS.get(mid)
            if not forms:
                missing.append(mid)
                forms = ["other"]
            if item.get("forms") != forms:
                item["forms"] = forms
                changed = True
        if changed:
            path.write_text(
                json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print("updated", path.name)
    if missing:
        print("defaulted to other:", ", ".join(missing))


if __name__ == "__main__":
    main()
