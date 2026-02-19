# Architecture

## System Overview

Lab Literacy Companion uses a structured, multi-step system to process lab reports locally in the browser.

Each agent handles a specific task, coordinated by an orchestrator that ensures correct sequencing and error handling.

---

## Multi-Agent System

### 1. Parser Agent

Extracts marker values and reference ranges from OCR text.

Input: Raw text from Tesseract.js  
Output: Structured list of detected markers with values, units, and ranges  

Handles multiple lab report formats:
- Table layouts
- Inline text
- Flagged results (H/L indicators)

### 2. Normalizer Agent

Standardizes biomarker names for consistent lookup.

Input: Raw marker names (e.g., "Hgb", "chol", "HbA1c")  
Output: Standardized names (e.g., "Hemoglobin", "Total Cholesterol", "Hemoglobin A1C")  

Uses a mapping table to standardize common lab abbreviations.

### 3. Context Agent

Loads MedGemma generated educational content for each marker.

Input: Standardized marker name  
Output: Explanation, research context, and dietary patterns  

Content is pre-generated and embedded as JSON. No runtime API calls.

### 4. Evidence Agent

Adds population-level dietary pattern information aligned with USDA 2020 guidelines.

Input: Marker name  
Output: Food and lifestyle patterns related to the marker  

### 5. Questions Agent

Generates doctor visit discussion questions tailored to detected markers.

Input: Marker name, value, and status  
Output: A set of structured discussion questions based on detected markers 

Question types:
- Interpretation
- Concern assessment
- Lifestyle changes
- Follow-up timing
- Treatment considerations

### 6. Safety Agent

Validates that all output is educational and non-diagnostic.

Input: Generated content  
Output: Validated content with rewrites if needed  

Prevents:
- Prescriptive language
- Diagnostic statements
- Treatment recommendations
- Personalized medical advice

---

## Orchestrator

Coordinates all agents in the correct sequence:

1. OCR (Tesseract.js) extracts text from uploaded file
2. Parser identifies markers
3. Normalizer standardizes names
4. Context + Evidence agents load content (parallel)
5. Questions agent generates discussion points
6. Safety agent validates everything
7. Results returned to UI



Error handling: Each agent wrapped in try-catch with graceful fallbacks.

---

## Data Flow

```
User uploads file
    ↓
OCR extracts text (local)
    ↓
Parser finds markers
    ↓
Normalizer standardizes names
    ↓
Context/Evidence agents load content (parallel)
    ↓
Questions agent generates questions
    ↓
Safety agent validates
    ↓
Results stored in sessionStorage
    ↓
User views results
    ↓
User closes tab (data deleted)
```

---

## Privacy Architecture

All processing happens in the browser:

- OCR: Tesseract.js (runs locally)
- Parsing: Pattern matching in JavaScript
- Content: Pre-loaded JSON (no API calls)
- Storage: sessionStorage (cleared on tab close)

No data sent to servers at any point.

---

## Technology Stack

- Next.js 14: App Router, TypeScript
- Tesseract.js: Browser-based OCR
- pdf.js: PDF text extraction
- MedGemma 1.5 4B: Content generation (offline)
- jsPDF: Export functionality

---

## File Structure (Core Agents)

lib/agents/
├── orchestrator/      # Coordinates agent workflow
├── parser/            # OCR, extraction, normalization, whitelist
├── context/           # MedGemma content loader
├── evidence/          # Research + dietary pattern layer
├── questions/         # Doctor visit question generation
├── safety/            # Validation + rewrite rules
└── types.ts           # Shared type definitions

data/
└── medgemma-outputs.json  # Pre-generated educational content

```


## Why This Architecture?

Separation of concerns: Each agent has one job, easier to test and improve individually.

Privacy by design: All agents run locally, no external dependencies.

Safety first: Dedicated validation layer prevents medical advice from slipping through.

Transparency: Clear system makes it easy to explain what the system does.

Extensibility: New agents can be added without changing existing ones.