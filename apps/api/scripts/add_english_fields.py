"""Add answerEn to FAQ JSON and usesEn/warningsEn to medicine JSON.

Run from apps/api:

    python -m scripts.add_english_fields
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
FAQ_DIR = ROOT / "data" / "faqs"
MED_DIR = ROOT / "data" / "medicines"

ANSWER_EN: dict[str, str] = {
    "fever-01": (
        "Fever is when body temperature rises above normal. If you have a thermometer, "
        "measure with it. If not, feel the forehead and chest with the back of your hand; "
        "if very hot, it may be fever. Fever itself is not a disease — it is a sign of another illness."
    ),
    "fever-02": (
        "Rest a lot and drink plenty of water, soup, or other fluids. Wear light clean clothes "
        "and keep the room aired. Wipe the forehead with a cloth dampened in lukewarm water. "
        "Ask a doctor or pharmacist before taking any medicine."
    ),
    "fever-03": (
        "Take the child to a hospital or clinic right away if: younger than two months with fever, "
        "has a seizure, is very sleepy and will not wake, cannot drink milk or water, vomits "
        "everything, or breathes fast and hard."
    ),
    "fever-04": (
        "If fever lasts more than three days, or returns every day, go to a clinic. Children, "
        "older adults, and pregnant women should go sooner. With severe headache, stiff neck, "
        "or loss of consciousness, go to hospital immediately."
    ),
    "fever-05": (
        "No. Heavy blankets and thick clothes can raise body heat further. Wear light clothes; "
        "if you feel cold, use one thin cover. Do not wrap children in too many layers either."
    ),
    "fever-06": (
        "In areas where malaria is present, every fever should be tested for malaria. Go to a "
        "clinic for a blood test. Malaria needs prompt treatment; delay can be dangerous, "
        "especially for children and pregnant women."
    ),
    "fever-07": (
        "Go to hospital immediately if fever comes with: stiff neck, severe headache, "
        "confusion or unconsciousness, seizure, breathing difficulty, red or dark skin spots "
        "that do not fade when pressed, or weakness so severe you cannot stand."
    ),
    "child-care-01": (
        "For the first six months, give only breast milk; even water is not needed. Start "
        "breastfeeding within the first hour after birth. After six months, begin other foods "
        "and continue breastfeeding to two years or longer."
    ),
    "child-care-02": (
        "When the baby is six months old, start soft foods such as potato, rice, lentils, egg, "
        "and fruit. Begin with small amounts and increase slowly. Prepare food cleanly and wash "
        "your hands first. Keep breastfeeding as well."
    ),
    "child-care-03": (
        "If a child is very thin, is not gaining weight, has swollen feet or face, is very tired "
        "and weak, or has changed hair colour, they may be malnourished. Take them to a clinic "
        "for weight and height checks. Swollen feet are a danger sign."
    ),
    "child-care-04": (
        "Take a newborn to hospital immediately if: they will not feed, have a seizure, breathe "
        "fast or hard, feel very cold or very hot, are yellow all over, or the cord area is red "
        "and pus-filled."
    ),
    "child-care-05": (
        "Wash hands with soap and water after using the toilet, after cleaning a child, before "
        "cooking, and before eating or feeding a child. Handwashing reduces diarrhea and "
        "respiratory illness."
    ),
    "child-care-06": (
        "Fast or difficult breathing, or the lower chest pulling in when breathing, can be a "
        "sign of pneumonia. Take the child to a clinic or hospital at once. Do not give "
        "medicines on your own."
    ),
    "child-care-07": (
        "Regular weighing shows whether a child is growing well. Bring the child for vaccines "
        "and check-ups and record their weight. If weight has not increased for several months, "
        "talk with a health worker."
    ),
    "diarrhea-ors-01": (
        "ORS is a special salt-and-sugar powder mixed in water. During diarrhea the body loses "
        "water and salts; ORS replaces them and helps prevent dehydration. ORS is available in "
        "many clinics and pharmacies."
    ),
    "diarrhea-ors-02": (
        "Wash your hands first. Mix one ORS packet in the amount of clean or boiled-and-cooled "
        "water written on the packet. Do not use less or more water than stated. Use the mixed "
        "ORS within one day and throw away leftovers."
    ),
    "diarrhea-ors-03": (
        "Yes. Do not stop breast milk or usual food. Give more fluids than usual. Avoid very "
        "sweet drinks such as soft drinks, which can worsen diarrhea."
    ),
    "diarrhea-ors-04": (
        "Dry mouth and tongue, strong thirst, little or dark urine, sunken eyes, and a restless "
        "or very weak child. If pinched belly skin returns slowly, dehydration is severe — go "
        "to a clinic immediately."
    ),
    "diarrhea-ors-05": (
        "Go to hospital immediately if: there is blood in the stool, the child vomits everything "
        "they drink, is very weak or unconscious, has high fever, or shows dehydration signs. "
        "If diarrhea lasts more than three days, go to a clinic."
    ),
    "diarrhea-ors-06": (
        "Drink clean or boiled water, wash hands with soap, keep food clean and covered, use a "
        "toilet, and give only breast milk for the first six months. Rotavirus vaccine also "
        "reduces diarrhea in children."
    ),
    "diarrhea-ors-07": (
        "Give breast milk, clean water, soup, rice water, or yoghurt drinks. Get ORS as soon as "
        "you can or go to a clinic. Avoid very sweet drinks and sugary juices."
    ),
    "pregnancy-01": (
        "WHO recommends at least eight check-ups during pregnancy. Have the first visit as soon "
        "as you know you are pregnant. Visits check blood pressure, baby growth, and anemia."
    ),
    "pregnancy-02": (
        "Go to hospital immediately if: bleeding, severe headache with blurred vision, seizure, "
        "sudden swelling of face or hands, high fever, severe belly pain, sudden water breaking, "
        "or the baby’s movements decrease or stop."
    ),
    "pregnancy-03": (
        "Eat a variety of foods: vegetables, fruit, lentils, beans, eggs, meat, milk, and yoghurt. "
        "Drink plenty of clean water. Clinic staff will tell you which vitamin or iron tablets "
        "you need — do not start them on your own."
    ),
    "pregnancy-04": (
        "During birth, sudden problems can occur such as heavy bleeding or a baby who does not "
        "breathe. A hospital or clinic has a trained midwife or doctor who can help quickly. "
        "Plan transport and money in advance."
    ),
    "pregnancy-05": (
        "After birth, go to hospital immediately for heavy bleeding, high fever, foul-smelling "
        "discharge, severe headache, shortness of breath, seizure, or hard painful red breasts. "
        "A mother-and-baby check in the first week is important."
    ),
    "pregnancy-06": (
        "No. Some medicines harm the baby. In pregnancy, take any medicine — even for headache, "
        "cough, or herbal remedies — only after asking a doctor or pharmacist. Tell them you "
        "are pregnant."
    ),
    "pregnancy-07": (
        "The tetanus vaccine protects the mother and newborn from tetanus. It is given at the "
        "clinic during pregnancy. Keep your vaccination card and show it to the health worker."
    ),
    "vaccines-01": (
        "Vaccines teach the body to fight dangerous diseases such as measles, polio, "
        "tuberculosis, and tetanus. Vaccinated children get sick less often. Vaccines protect "
        "both the child and the community."
    ),
    "vaccines-02": (
        "At birth or soon after, babies usually receive first vaccines such as BCG "
        "(tuberculosis), polio, and hepatitis B. Other vaccines follow at set months. Get the "
        "schedule and card from your clinic."
    ),
    "vaccines-03": (
        "Do not worry — usually you do not need to start over. Take the child to the clinic as "
        "soon as you can and bring the vaccination card. The health worker will give the missed "
        "doses."
    ),
    "vaccines-04": (
        "Yes — mild fever, pain or redness at the injection site, and a little crying are common "
        "and usually improve in one or two days. Give milk and fluids. For high fever, seizure, "
        "breathing trouble, or facial swelling, go to a clinic immediately."
    ),
    "vaccines-05": (
        "Yes. Vaccines are tested carefully before use and given to millions of children "
        "worldwide. Serious side effects are very rare. The risk from the disease is much "
        "greater than the risk from the vaccine."
    ),
    "vaccines-06": (
        "Measles is highly contagious and can cause pneumonia, diarrhea, blindness, or death. "
        "Signs include fever, cough, red eyes, and a red body rash. Both measles vaccine doses "
        "protect the child. Take a child with these signs to a clinic."
    ),
    "vaccines-07": (
        "Polio can permanently paralyse a child’s arms or legs and has no cure — only vaccine "
        "prevents it. Several rounds of polio drops are needed for full protection, so bring "
        "the child to every campaign and clinic appointment."
    ),
    "when-to-visit-clinic-01": (
        "Go to hospital or get help immediately for: severe breathing difficulty, severe chest "
        "pain, unconsciousness, seizure, heavy bleeding, sudden weakness on one side of the "
        "body or trouble speaking, or a severe burn."
    ),
    "when-to-visit-clinic-02": (
        "If a cough lasts more than two weeks — especially with fever, night sweats, weight "
        "loss, or blood in sputum — go to a clinic and ask for a tuberculosis test. TB is "
        "treatable."
    ),
    "when-to-visit-clinic-03": (
        "If chest pain is severe, spreads to the arm, neck, or jaw, or comes with sweating, "
        "nausea, or shortness of breath, it may be a heart attack. Go to hospital immediately "
        "and do not go alone."
    ),
    "when-to-visit-clinic-04": (
        "Go to hospital immediately if headache is sudden and very severe, starts after an "
        "injury, comes with fever and stiff neck, or with weakness, vision problems, or "
        "confusion. For headaches that keep returning, go to a clinic."
    ),
    "when-to-visit-clinic-05": (
        "Hold the burn under cool — not icy — running water for about twenty minutes. Remove "
        "rings and tight items. Do not put oil, butter, toothpaste, or home pastes on the burn. "
        "Take large burns, face or hand burns, and burns in children to hospital."
    ),
    "when-to-visit-clinic-06": (
        "Wash the wound immediately for fifteen minutes with soap and plenty of water. Then go "
        "to a clinic quickly to decide about rabies vaccine. Rabies is almost always fatal once "
        "symptoms start, so do not delay."
    ),
    "when-to-visit-clinic-07": (
        "Mild cold, mild cough, or mild headache often improves with rest and fluids. If "
        "symptoms do not improve after a few days or get worse — or if you are a child, older "
        "adult, pregnant, or have a long-term illness — go to a clinic. If unsure, ask a health "
        "worker."
    ),
}

# Generic non-prescribing English for each catalog medicine (uses / warnings).
MEDICINE_EN: dict[str, tuple[str, str]] = {
    "med-paracetamol": (
        "This medicine is commonly used to ease headache, body aches, and fever. It does not diagnose illness. Do not choose a dose yourself — ask a doctor or pharmacist.",
        "Do not take more than advised; large amounts can harm the liver. If you have liver disease, or take other products that contain paracetamol, ask first. Do not dose children or pregnant people without health advice. Seek clinic care for severe allergy, breathing trouble, or skin rash.",
    ),
    "med-ibuprofen": (
        "This medicine is commonly used to ease pain, inflammation, and fever. Do not set your own dose; ask a doctor or pharmacist.",
        "Avoid on an empty stomach if your stomach is sensitive. Ask first if you have stomach ulcers, bleeding, kidney problems, or heart disease. Do not combine with aspirin or similar medicines without advice. Pregnancy and young children need special care.",
    ),
    "med-aspirin": (
        "This medicine is sometimes used for pain or as advised by a clinician for other reasons. It is not for self-diagnosis. Ask a doctor or pharmacist before use.",
        "Do not give aspirin to children or teenagers with viral illness unless a clinician says so. Ask first if you have bleeding problems, stomach ulcers, or asthma. Seek urgent care for black stools, vomiting blood, or severe allergy.",
    ),
    "med-diclofenac": (
        "This medicine is commonly used for pain and inflammation when advised by a clinician. Do not decide the dose yourself.",
        "Can irritate the stomach and affect kidneys or heart risk in some people. Ask before use if you have ulcers, kidney disease, or heart problems. Not for unsupervised use in pregnancy.",
    ),
    "med-mefenamic-acid": (
        "This medicine is sometimes used for pain when a clinician advises it. Identification only — ask a professional about use.",
        "May upset the stomach or affect kidneys. Ask first if you have ulcers, kidney disease, or are pregnant. Stop and seek care for severe belly pain or allergic signs.",
    ),
    "med-naproxen": (
        "This medicine is commonly used for pain and inflammation under clinical advice. Do not self-prescribe a dose.",
        "Ask first with stomach ulcers, kidney disease, heart disease, or pregnancy. Take with food if advised. Seek care for black stools or breathing difficulty.",
    ),
    "med-ors": (
        "ORS replaces water and salts lost in diarrhea. Mix only as written on the packet. It does not treat the cause of every illness — seek care if danger signs appear.",
        "Use clean water and the correct amount. Discard leftover solution after one day. Go to a clinic for blood in stool, repeated vomiting, or severe weakness.",
    ),
    "med-zinc-sulfate": (
        "Zinc is sometimes given with ORS for childhood diarrhea when a health worker advises it. Ask a clinician for suitability and timing.",
        "Follow clinic advice for children. Do not replace ORS or clinic care. Seek help if the child worsens or cannot drink.",
    ),
    "med-electrolyte-solution": (
        "Electrolyte drinks or solutions help replace fluids and salts. Prefer ORS for diarrhea when available. Ask a pharmacist if unsure which product you have.",
        "Very sweet soft drinks are not a substitute. Seek clinic care for severe dehydration signs.",
    ),
    "med-omeprazole": (
        "This medicine is commonly used for stomach acid problems when a clinician advises it. It does not diagnose your condition.",
        "Ask a doctor or pharmacist before long or unsupervised use. Seek care for vomiting blood, black stools, or severe belly pain.",
    ),
    "med-famotidine": (
        "This medicine is commonly used to reduce stomach acid when advised. Ask a professional before use.",
        "Tell the clinician about other medicines you take. Seek care for severe allergy or ongoing severe pain.",
    ),
    "med-antacid": (
        "Antacids are commonly used for short-term heartburn or indigestion relief. They do not cure serious disease.",
        "Ask if you have kidney disease or take other medicines. Persistent or severe pain needs clinic assessment.",
    ),
    "med-loperamide": (
        "This medicine is sometimes used to slow diarrhea in adults when a clinician or pharmacist advises it. Not for every situation.",
        "Do not use if there is blood in stool, high fever, or in young children unless a clinician says so. Seek care if symptoms are severe.",
    ),
    "med-domperidone": (
        "This medicine is sometimes used for nausea when a clinician advises it. Do not self-prescribe.",
        "Ask about heart rhythm risks and other medicines. Not for unsupervised use in children or pregnancy without advice.",
    ),
    "med-cetirizine": (
        "This medicine is commonly used for allergy symptoms such as itching or runny nose when advised. Ask a pharmacist or doctor.",
        "May cause drowsiness in some people. Ask before use in pregnancy, breastfeeding, or with other sedating medicines.",
    ),
    "med-loratadine": (
        "This medicine is commonly used for allergy symptoms when advised. Identification only — confirm suitability with a professional.",
        "Ask about other medicines and liver disease. Seek care for severe allergic reactions.",
    ),
    "med-chlorpheniramine": (
        "This medicine is commonly used for allergy symptoms when advised. It may cause sleepiness.",
        "Avoid driving or risky work if drowsy. Ask before use in children, older adults, or pregnancy.",
    ),
    "med-salbutamol": (
        "This inhaler or medicine is used for breathing problems such as asthma when prescribed. It does not replace emergency care.",
        "If breathing is still hard after use, go to hospital. Only use the device and dose a clinician taught you.",
    ),
    "med-dextromethorphan": (
        "This cough medicine is sometimes used for dry cough in adults when advised. It does not treat pneumonia.",
        "Ask before use with other cough/cold products. Seek care for fast breathing, chest pain, or cough with blood.",
    ),
    "med-amoxicillin": (
        "This is an antibiotic used only when a clinician decides it is needed. It does not work for every infection.",
        "Never start or share antibiotics on your own. Finish the course only as told. Seek care for rash, swelling, or breathing trouble.",
    ),
    "med-azithromycin": (
        "This is an antibiotic used only under clinical advice for certain infections.",
        "Do not self-start antibiotics. Tell the clinician about heart medicines and allergies. Seek care for severe side effects.",
    ),
    "med-metronidazole": (
        "This medicine is used for certain infections when a clinician prescribes it. Avoid alcohol if advised.",
        "Do not use without a prescription decision. Ask about pregnancy and other medicines. Seek care for severe rash or neurological symptoms.",
    ),
    "med-ciprofloxacin": (
        "This is an antibiotic used only when prescribed for specific infections.",
        "Not for unsupervised use. Ask about tendon pain, children, and pregnancy. Complete only as directed by a clinician.",
    ),
    "med-cotrimoxazole": (
        "This antibiotic combination is used only when a clinician advises it.",
        "Tell staff about sulfa allergy. Do not self-medicate. Seek care for rash or breathing difficulty.",
    ),
    "med-doxycycline": (
        "This antibiotic is used only under clinical advice. It can increase sun sensitivity.",
        "Ask about pregnancy, children, and other medicines. Do not start antibiotics without advice.",
    ),
    "med-albendazole": (
        "This medicine is used for certain worm infections when a health programme or clinician advises it.",
        "Ask before use in pregnancy or young children. Follow the dose schedule given by health staff.",
    ),
    "med-mebendazole": (
        "This medicine is used for certain worm infections when advised by a clinician or campaign.",
        "Ask about pregnancy and children’s dosing. Hygiene still matters to prevent reinfection.",
    ),
    "med-metformin": (
        "This medicine is used for diabetes when prescribed and monitored by a clinician. It is not for self-diagnosis.",
        "Do not start or change diabetes medicines alone. Seek urgent care for severe vomiting, deep breathing, or confusion.",
    ),
    "med-amlodipine": (
        "This medicine is used for blood pressure when prescribed. Keep follow-up with your clinician.",
        "Do not stop or change dose without advice. Seek care for severe dizziness, chest pain, or swelling that worries you.",
    ),
    "med-atorvastatin": (
        "This medicine is used for cholesterol when prescribed. Lifestyle advice from your clinic still matters.",
        "Tell the clinician about muscle pain or other medicines. Not for unsupervised use in pregnancy.",
    ),
    "med-oral-contraceptive": (
        "Oral contraceptives are used for family planning when counselled by a clinic. Choose a method with a health worker.",
        "Ask about smoking, migraine, clotting history, and breastfeeding. Seek care for severe leg pain, chest pain, or vision changes.",
    ),
    "med-insulin": (
        "Insulin is used for diabetes only under clinical training and prescription. Never share pens or needles.",
        "Learn hypoglycemia signs from your clinic. Seek urgent care for confusion, seizure, or inability to swallow sugar.",
    ),
    "med-povidone-iodine": (
        "This antiseptic is commonly used to clean skin around minor wounds when advised. It is not for deep or serious injuries alone.",
        "Ask about iodine allergy and thyroid disease. Large or dirty wounds need clinic care.",
    ),
    "med-clotrimazole": (
        "This cream is commonly used for certain fungal skin infections when advised. Confirm the problem with a professional if unsure.",
        "Ask before use in pregnancy. Seek care if the rash worsens, spreads, or looks infected.",
    ),
    "med-hydrocortisone-cream": (
        "Mild steroid cream is sometimes used for itchy inflamed skin when advised. Use only as directed on the label or by a clinician.",
        "Avoid long use on the face or broken skin without advice. Seek care for spreading infection or no improvement.",
    ),
    "med-tetracycline-eye-ointment": (
        "This eye ointment is used for certain eye infections when a clinician advises it. Do not self-treat severe eye pain.",
        "Seek urgent care for vision loss, strong light pain, or injury. Do not share eye medicines.",
    ),
    "med-hydrogen-peroxide": (
        "This solution is sometimes used to clean minor cuts. It is not ideal for every wound.",
        "Do not swallow. Deep, dirty, or animal-bite wounds need clinic care, not home cleaning alone.",
    ),
    "med-multivitamin": (
        "Multivitamins may support nutrition when diet is poor, but they do not treat serious disease. Ask a pharmacist if needed.",
        "Keep away from children in overdose amounts. Seek clinic care for unexplained weight loss or ongoing illness.",
    ),
    "med-ferrous-sulfate": (
        "Iron tablets are used for iron deficiency when a clinician advises them. They do not replace clinic testing when needed.",
        "Overdose is dangerous, especially for children. Ask about dose and constipation. Seek care for severe belly pain.",
    ),
    "med-folic-acid": (
        "Folic acid is often advised before and during early pregnancy and for some anemias. Follow clinic advice.",
        "Tell the clinician about other medicines. It does not replace antenatal visits.",
    ),
    "med-vitamin-d": (
        "Vitamin D is sometimes advised when deficiency is found or risk is high. Ask a clinician about need and dose.",
        "High doses without advice can be harmful. Seek care for ongoing bone pain or muscle weakness evaluation.",
    ),
    "med-calcium": (
        "Calcium supplements are sometimes used when diet is low or a clinician advises them.",
        "Ask about kidney stones and other medicines. Supplements do not replace medical care for severe symptoms.",
    ),
}


def _write_json(path: Path, data: object) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def update_faqs() -> None:
    missing: list[str] = []
    for path in sorted(FAQ_DIR.glob("*.json")):
        if path.name == "categories.json":
            continue
        items = json.loads(path.read_text(encoding="utf-8"))
        for item in items:
            faq_id = item["id"]
            if faq_id not in ANSWER_EN:
                missing.append(faq_id)
                continue
            # Insert answerEn right after answerPs for readable diffs.
            if "answerEn" in item:
                item["answerEn"] = ANSWER_EN[faq_id]
            else:
                new_item = {}
                for key, value in item.items():
                    new_item[key] = value
                    if key == "answerPs":
                        new_item["answerEn"] = ANSWER_EN[faq_id]
                item.clear()
                item.update(new_item)
        _write_json(path, items)
    if missing:
        raise SystemExit(f"Missing answerEn for: {', '.join(missing)}")


def update_medicines() -> None:
    missing: list[str] = []
    for path in sorted(MED_DIR.glob("*.json")):
        if path.name == "categories.json":
            continue
        items = json.loads(path.read_text(encoding="utf-8"))
        for item in items:
            med_id = item["id"]
            if med_id not in MEDICINE_EN:
                missing.append(med_id)
                continue
            uses_en, warnings_en = MEDICINE_EN[med_id]
            new_item = {}
            for key, value in item.items():
                new_item[key] = value
                if key == "usesPs":
                    new_item["usesEn"] = uses_en
                if key == "warningsPs":
                    new_item["warningsEn"] = warnings_en
            # If fields already existed mid-object, overwrite via assignment below.
            new_item["usesEn"] = uses_en
            new_item["warningsEn"] = warnings_en
            # Rebuild in preferred key order.
            ordered = {
                "id": new_item["id"],
                "category": new_item["category"],
                "names": new_item["names"],
                "usesPs": new_item["usesPs"],
                "usesEn": uses_en,
                "warningsPs": new_item["warningsPs"],
                "warningsEn": warnings_en,
                "audioUrl": new_item["audioUrl"],
                "source": new_item["source"],
                "lastReviewed": new_item["lastReviewed"],
                "reviewStatus": new_item["reviewStatus"],
            }
            item.clear()
            item.update(ordered)
        _write_json(path, items)
    if missing:
        raise SystemExit(f"Missing medicine English for: {', '.join(missing)}")


def main() -> int:
    update_faqs()
    update_medicines()
    print(f"Updated FAQs with answerEn ({len(ANSWER_EN)} entries).")
    print(f"Updated medicines with usesEn/warningsEn ({len(MEDICINE_EN)} entries).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
