"""
Generate comprehensive content using MedGemma 1.5 4B
Includes: explanation, research, and food patterns
"""

from transformers import AutoProcessor, AutoModelForImageTextToText
import torch
import json
from datetime import datetime
import os
import re
import argparse
import random
import numpy as np


def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def extract_section(label: str, text: str) -> str:
    """
    Extracts text following 'Task X:' until the next Task or end of text.
    Works even if the model adds newlines between sections.
    """
    pattern = rf"{re.escape(label)}\s*:\s*(.*?)(?=\n\s*Task\s*\d\s*:|\Z)"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else ""


def safety_scrub(text: str) -> str:
    """
    Lightweight local safety cleanup (no LLMs).
    Keeps it simple: removes direct prescriptive phrasing.
    """
    if not text:
        return text

    replacements = [
        (r"\byou should\b", "research often discusses"),
        (r"\byou need to\b", "studies often examine"),
        (r"\byou must\b", "research sometimes notes"),
        (r"\bi recommend\b", "some clinicians discuss"),
        (r"\bmy recommendation is\b", "a common discussion point is"),
        (r"\btake\b\s+(a|an|this|these)?\s*(supplement|medication|pill|drug)\b", "discuss options with a clinician"),
        (r"\byou have\b", "this may be associated with"),
    ]

    cleaned = text
    for pattern, replacement in replacements:
        cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

    return cleaned.strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="../data/medgemma-outputs.json")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    set_seed(args.seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

    print("\n" + "=" * 60)
    print("🏥 MEDGEMMA 1.5 4B COMPREHENSIVE CONTENT GENERATOR")
    print("=" * 60 + "\n")

    model_id = "google/medgemma-1.5-4b-it"

    print("📥 Loading MedGemma 1.5 4B...\n")

    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForImageTextToText.from_pretrained(
        model_id,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )

    print("✅ Model loaded!\n")

    markers = [
        # Blood Count (6)
        "Hemoglobin",
        "Hematocrit",
        "White Blood Cells (WBC)",
        "Red Blood Cells (RBC)",
        "Platelets",
        "Mean Corpuscular Volume (MCV)",

        # Metabolic Panel (9)
        "Glucose (fasting)",
        "Hemoglobin A1C",
        "Creatinine",
        "Blood Urea Nitrogen (BUN)",
        "eGFR (kidney function)",
        "Sodium",
        "Potassium",
        "Calcium",
        "Chloride",

        # Lipid Panel (4)
        "Total Cholesterol",
        "LDL Cholesterol",
        "HDL Cholesterol",
        "Triglycerides",

        # Liver Function (4)
        "ALT (alanine aminotransferase)",
        "AST (aspartate aminotransferase)",
        "Alkaline Phosphatase",
        "Bilirubin",

        # Thyroid (2)
        "TSH (thyroid stimulating hormone)",
        "T4 (thyroxine)",

        # Vitamins/Minerals (5)
        "Vitamin D",
        "Vitamin B12",
        "Folate",
        "Ferritin (iron storage)",
        "Iron",
    ]

    results = {
        "generated_at": datetime.now().isoformat(),
        "model": model_id,
        "note": "Generated using MedGemma 1.5 4B for Lab Literacy Companion",
        "markers": {},
        "seed": args.seed,
    }

    for i, marker in enumerate(markers, 1):
        print(f"[{i}/{len(markers)}] 🧬 {marker}...")

        prompt = f"""You are a helpful patient educator. Explain {marker} in simple language.

Task 1: Write 2-3 short sentences: What is {marker} and why is it measured in lab tests?

Task 2: Write 2-3 short sentences: What does population-level research say about {marker}? Use neutral phrases like 'Research often discusses' or 'Studies examine'. Never give personal advice.

Task 3: Write 3-4 sentences: Describe population-level food patterns related to {marker} from USDA 2020 Dietary Guidelines. List relevant MyPlate groups (e.g., Protein Foods, Vegetables, Fruits, Grains) with examples. Use neutral language like 'Research discusses...'. Never prescriptive.

CRITICAL RULES:
- Do NOT include any thinking steps, reasoning, or internal notes
- Do NOT start with "<unused" or any tags
- Write ONLY the three sections, clearly labeled
- Start immediately with Task 1

Format:
Task 1: [your explanation]
Task 2: [research context]
Task 3: [food patterns]"""

        messages = [{
            "role": "user",
            "content": [{"type": "text", "text": prompt}]
        }]

        inputs = processor.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt"
        ).to(model.device, dtype=torch.bfloat16)

        input_len = inputs["input_ids"].shape[-1]

        with torch.inference_mode():
            generation = model.generate(
                **inputs,
                max_new_tokens=400,
                do_sample=False,
            )
            generation = generation[0][input_len:]

        output = processor.decode(generation, skip_special_tokens=True).strip()

        # ✅ Parse the output (robust) — INSIDE the loop
        explanation = extract_section("Task 1", output)
        research = extract_section("Task 2", output)
        food_patterns = extract_section("Task 3", output)

        # Fallback if MedGemma didn't follow the format
        if not explanation and not research and not food_patterns:
            sentences = output.split(". ")
            if len(sentences) >= 3:
                explanation = ". ".join(sentences[:2]) + "."
                research = ". ".join(sentences[2:4]) + "."
                if len(sentences) > 4:
                    food_patterns = ". ".join(sentences[4:]) + "."

        # Remove any tags
        explanation = re.sub(r"<[^>]+>", "", explanation).strip()
        research = re.sub(r"<[^>]+>", "", research).strip()
        food_patterns = re.sub(r"<[^>]+>", "", food_patterns).strip()

        # Safety scrub (local, no extra models)
        explanation = safety_scrub(explanation)
        research = safety_scrub(research)
        food_patterns = safety_scrub(food_patterns)

        results["markers"][marker] = {
            "explanation": explanation,
            "research_context": research,
            "food_patterns": food_patterns,
            "raw_output": output,
        }

        print(f"   Explanation: {explanation[:60]}...")
        print(f"   Research: {research[:60]}...")
        print(f"   Food: {food_patterns[:60] if food_patterns else 'N/A'}...")
        print("   ✓ Complete!\n")

    out_path = args.out
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 60)
    print("✅ SUCCESS! ALL CONTENT GENERATED!")
    print("=" * 60)
    print(f"\n📄 Saved to: {out_path}")
    print("📊 Content includes: explanation, research, food patterns")
    print("\n🏆 Ready to use in your app!\n")


if __name__ == "__main__":
    main()
