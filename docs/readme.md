# Lab Literacy Companion
Privacy-First • Local Processing • MedGemma 1.5 4B (Offline)

Developed by Krista Reed for the MedGemma Impact Challenge.

Lab Literacy Companion transforms complex lab reports into clear, structured summaries to help patients prepare for doctor visits without sending health data to the cloud.

Live Demo: https://labcompanion.netlify.app  
Demo Video: https://youtu.be/dL1PVIQrC9o  
---

## The Problem

Patients receive lab results filled with medical jargon and reference ranges they don't understand. This often leads to anxiety, misinformation, and unprepared doctor visits. Many people find themselves googling unfamiliar markers late at night, trying to make sense of numbers without context.

Many AI tools "help" by uploading sensitive health data to servers, creating additional privacy concerns.

Lab Literacy Companion addresses both issues: clearer explanations and fully local processing.

---

## The Solution

Lab Literacy Companion is a 100% browser-based tool that analyzes lab reports locally:

- Explains supported lab markers in simple terms  
- Shows research context using MedGemma-generated educational content (generated offline)  
- Generates doctor-visit discussion questions based on detected markers  
- Processes everything locally — your health data never leaves your device  

---

## Key Features

- Upload lab images/PDFs or try bundled sample reports
- Health Snapshot showing at-a-glance summary of results
- Detailed marker explanations with research context
- Generated doctor visit questions
- Agent dashboard
- Delete All Data button

---

## User Guide

1. Try a sample from the Lab Samples provided, click on a sample report, or upload your own lab report (image or PDF - must be in English)
2. Click “Analyze Results” - Your results appear in a structured summary
3. Click any marker name, read the explanation, and review suggested questions for your doctor
4. Export PDF for doctor visit

--

## MedGemma Integration

MedGemma 1.5 4B was used to generate educational content for 30 supported lab markers.

Process:
- A Python script ran offline inference to produce structured explanations and research summaries  
- The outputs were saved as JSON and embedded directly into the application  
- At runtime, the app does not call MedGemma or any external API  

Watch the generation process: https://youtu.be/t-4qlBxfGig
Hugging Face model card: https://huggingface.co/datasets/kristar0609/medgemma-lab-literacy-outputs 

---

## Architecture

Lab Literacy Companion is organized into a multi-agent system coordinated by an orchestrator:

1. Parser Agent – Extracts and normalizes marker values, reference ranges, and biomarker names from OCR text (e.g., "Hgb" → "Hemoglobin")
2. Context Agent – Loads MedGemma-generated educational explanations and research context
3. Evidence Agent – Adds population-level dietary pattern notes (e.g., USDA 2020 guidance)
4. Questions Agent – Generates discussion questions for a doctor visit based on detected markers
5. Safety Agent – Applies rules to keep the output educational and non-diagnostic
6. Orchestrator – Coordinates all agents and tracks execution timing


OCR is handled locally using Tesseract.js before the parsing stage begins.

---

## Privacy

All processing happens locally in the browser. Lab data is not uploaded to any server.

- No cloud uploads  
- OCR runs locally using Tesseract.js  
- Data is stored in session storage and cleared when the tab closes  
- No analytics, cookies, or third-party scripts  

---

## Safety & Scope

This tool is educational only.

Does not:
- Diagnose conditions  
- Prescribe treatments  
- Replace your doctor  

Does:
- Explain what supported markers represent  
- Share population-level research context  
- Generate doctor visit discussion questions  

Currently supports English-language lab reports with 30 common biomarkers.

---

## Tech Stack

- Next.js 14 (App Router)  
- TypeScript  
- Tailwind CSS  
- shadcn/ui  
- MedGemma 1.5 4B (offline content generation)  
- Tesseract.js (browser-based OCR)  
- pdf.js  
- jsPDF  

---

## Setup Instructions

```bash
git clone https://github.com/yourusername/lab-literacy-companion.git
cd lab-literacy-companion

npm install
npm run dev
```

Open `http://localhost:3000` in your browser and try a sample report.

No API keys or cloud setup required.




