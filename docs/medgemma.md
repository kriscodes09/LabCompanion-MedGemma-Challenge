# MedGemma Integration

## What is MedGemma?

MedGemma 1.5 4B is Google's open medical language model trained on biomedical literature.

Lab Literacy Companion uses MedGemma to generate educational content for 30 supported lab markers.

---

## How We Use It

Offline pre-generation approach:

1. Ran MedGemma 1.5 4B to generate educational content for each marker
2. Saved structured outputs as JSON
3. Embedded content directly in the application

At runtime, the app loads content from local JSON — no API calls to MedGemma.

---

## Why Offline?

- ✅ Privacy: No user data sent to external APIs
- ✅ Speed: Instant content loading
- ✅ Reliability: Works offline
- ✅ Cost: No API fees

---

## Content Structure

Each marker includes:

1. Explanation - What the marker measures and why doctors order it
2. Research Context - Population-level patterns from medical studies
3. Food Patterns - Dietary associations aligned with USDA 2020 guidelines

All content is educational only, not medical advice.

---

## Safety Validation

Generated content is validated to ensure:

- Population-level framing (not individual diagnosis)
- Research-based language ("studies show", not "you have")
- No medical advice or treatment recommendations
- Encouragement to consult healthcare providers

---

## Covered Markers

30 common lab markers across categories:

- Blood Count (CBC): Hemoglobin, WBC, RBC, Platelets, etc.
- Metabolic Panel: Glucose, BUN, Creatinine, Electrolytes
- Lipid Panel: Total Cholesterol, LDL, HDL, Triglycerides
- Liver Function: ALT, AST, Bilirubin
- Thyroid: TSH, T4
- Vitamins: D, B12, Folate, Ferritin

---

## Attribution

Educational content powered by **MedGemma 1.5 4B** from Google DeepMind.

Model: https://ai.google.dev/gemma/docs/medgemma