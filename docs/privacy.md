# Privacy Documentation

## Privacy-First Architecture

Lab Literacy Companion is built so that your lab data never leaves your device.

All processing happens locally in your browser. No lab reports, extracted text, or results are ever uploaded to a server.


---

## Local Processing (No Cloud)

All components run client-side:

- OCR: Tesseract.js (runs in the browser)
- Parsing & analysis: JavaScript multi-agent system
- Educational content: Pre-generated MedGemma JSON embedded in the app
- PDF export: jsPDF (runs locally)

There are no API calls involving user health data.

---

## Data Lifecycle

```
Upload file
   ↓
OCR runs locally
   ↓
Markers parsed & analyzed
   ↓
Results stored in sessionStorage
   ↓
Displayed to user
   ↓
Tab closed → data automatically deleted
```

---

## What Is Stored

Data is temporarily stored in sessionStorage only:

```javascript
sessionStorage.setItem('extractedMarkers', JSON.stringify(markers));
sessionStorage.setItem('uploadTime', timestamp);
```

Stored data includes:
- Marker names
- Values
- Units
- Reference ranges
- Status (low/normal/high)

No personal identifiers are stored.

---

## What Is NOT Stored

The application does not store:

- Lab report files
- Patient name
- Date of birth
- Medical record numbers
- Doctor information
- IP addresses
- Usage analytics
- Tracking cookies
- Server-side logs

There is no database and no backend health data storage.

---

## Automatic Deletion

Data is automatically cleared when:

- The browser tab is closed
- The browser is closed
- The session ends

Users can also manually delete all stored data at any time via the Delete All Data button.

---

## Third-Party Services

The app does not use:

- Analytics tools
- Tracking pixels
- Advertising networks
- Cloud storage providers
- External AI APIs

The Tesseract.js worker is loaded as a static asset and executes locally within the browser. It does not transmit user data to external servers.

---

## HIPAA Considerations

Lab Literacy Companion:

- Does not store Protected Health Information (PHI)
- Does not transmit PHI
- Does not act as a covered entity or business associate
- Provides educational information only

This application does not collect, store, or transmit Protected Health Information (PHI). All processing happens locally in the user’s browser, and no health data is sent to or retained by us. As a result, it is not intended to function as a HIPAA-covered entity or business associate.
---

## Verification

Users can verify privacy claims:

1. Open DevTools → Network tab
2. Upload a lab report
3. Confirm no uploads occur

All processing is observable as client-side activity only.

---

## Summary

- 100% local processing
- No cloud uploads
- No tracking
- Session-only storage
- User-controlled deletion
- No Persistent Storage

The application does not use:
- localStorage
- IndexedDB
- Cookies
- Service worker data caches for lab results

All lab-derived data exists only in sessionStorage and is cleared automatically when the session ends.

Your health data stays with you.