# HealthBridge AI — Backend starter

Flask backend for the HealthBridge AI hackathon MVP described in the pitch:
phone camera capture / document OCR → multilingual care-plan cards → patient voice or typed "Samjhao Wapas" response comparison → doctor clarification slip. Optional phone sensor context provides capture-quality tips (steady camera, lighting, and quieter audio).

## Requirements
- Python 3.10+
- Tesseract OCR installed on the computer (for images/scanned PDFs)
- Gemini API key

## Setup (Windows / VS Code)
1. Open this `backend` folder in VS Code.
2. Create a virtual environment:
   `python -m venv .venv`
3. Activate it in PowerShell:
   `.venv\\Scripts\\Activate.ps1`
4. Install packages:
   `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and add your Gemini API key (the `.env` file is git-ignored).
6. Install Tesseract OCR and, if necessary, set `TESSERACT_CMD` in `.env`.
7. Start:
   `python app.py`
8. Check `http://127.0.0.1:5000/api/health`.

## API endpoints
- `GET /api/health`
- `POST /api/mobile-context` — JSON context: optional `motion_score` (0–1), `ambient_light_lux`, `ambient_noise_db`, `camera_permission`, `microphone_permission`; returns non-clinical capture tips.
- `POST /api/care-plan` — multipart form: `file`, optional `language` (English/Hindi/Punjabi), optional `capture_context` JSON string with phone capture measurements
- `POST /api/verify` — JSON: `session_id`, `patient_response`, optional `language`
- `POST /api/clarification-slip` — JSON: `session_id`, `questions` array; returns PDF

## Safety / demo notes
Use synthetic sample discharge documents only during the hackathon. Do not upload real patient
records to an unapproved external AI service. This prototype is not a medical device, does not
diagnose, and must not modify medication instructions. Clinicians must verify the output.
SQLite (`database/healthbridge.db`) stores extracted text and care-plan data for the demo; delete the database after testing
and add authentication, encryption, retention controls, and consent before any real deployment.

## Surprise-element integration: “Superpowers in your pocket”
The mobile frontend can use the phone camera to scan the document and microphone for the Samjhao Wapas response. It may also pass optional capture measurements (motion stability, ambient light, and ambient noise) to `POST /api/mobile-context`; the backend returns capture-quality guidance rather than clinical judgments. Precise location is deliberately not requested or stored. Sensor permissions and measurements are optional, and users can upload/type instead.

Example request:
```json
{
  "context": {
    "motion_score": 0.72,
    "ambient_light_lux": 45,
    "ambient_noise_db": 71,
    "camera_permission": true,
    "microphone_permission": true
  }
}
```
