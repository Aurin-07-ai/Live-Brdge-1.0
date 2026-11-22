# LiveBridge AI — 1.0

**Live app:** [https://livebridge-five.vercel.app](https://livebridge-five.vercel.app)

**Backend API:** [https://livebridge-backend.onrender.com](https://livebridge-backend.onrender.com)
(health check: `/api/health`)

Patient-understanding and doctor-communication assistant. A patient (or caregiver) uploads a
hospital discharge summary, the Flask backend extracts it with OCR and Gemini, the React app
turns it into an accessible multilingual care plan, and the "Samjhao Wapas" check compares the
patient's own explanation with the document before producing a doctor clarification slip.

> **Demo / hackathon prototype only.** It is not a medical device, does not diagnose, and must
> never be used to change medication instructions without clinician confirmation. Do not upload
> real patient records to an unapproved external AI service.

> **Going live?** See [DEPLOYMENT.md](DEPLOYMENT.md) for the Vercel (frontend) + Render (backend)
> step-by-step guide.

---

## Repository layout

```
LiveBridge-1.0/
├── frontend/                  # React 18 + Vite + Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js         # dev server on http://localhost:3000
│   ├── .env.example           # VITE_API_URL / VITE_API_MODE
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       ├── context/AppContext.jsx   # app state, backend session id
│       ├── data/                    # demo data + translations
│       ├── pages/                   # upload, care plan, checks, doctor slip, panels
│       └── services/
│           ├── api.js               # all Flask API calls + response adapters
│           └── speechService.js
└── backend/                   # Python Flask
    ├── app.py                 # API routes
    ├── database.py            # SQLite sessions -> database/healthbridge.db
    ├── ocr.py                 # PDF text + Tesseract OCR
    ├── gemini_service.py      # care-plan generation + verification prompts
    ├── verification.py
    ├── mobile_context.py      # optional phone capture-quality tips
    ├── pdf_slip.py            # ReportLab doctor slip
    ├── requirements.txt
    ├── .env.example
    ├── database/healthbridge.db   # created on first run (git-ignored)
    ├── uploads/                   # temporary uploads (git-ignored)
    └── generated/                 # generated PDFs (git-ignored)
```

`.env`, the SQLite database, uploaded files, generated PDFs and `__pycache__` are intentionally
**not** tracked by Git.

---

## Quick start

### 1. Backend

Requires **Python 3.10+** and **Tesseract OCR** (needed for scanned PDFs and images).

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env      # then add your own GEMINI_API_KEY
python app.py
```

Health check: <http://127.0.0.1:5000/api/health>

If Tesseract is not on your PATH, set `TESSERACT_CMD` in `backend/.env`, e.g.
`TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe`.

### 2. Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env      # optional; defaults are already set in src/services/api.js
npm run dev
```

Open <http://localhost:3000>. With `VITE_API_MODE=auto` (default), the app calls the backend when
it is reachable and gracefully falls back to the built-in interactive demo when it is not. Use
`VITE_API_MODE=live` to require the backend, or `VITE_API_MODE=demo` to disable API calls.

To build for deployment: `npm run build` (output: `frontend/dist`).

---

## Environment variables

| File | Variable | Purpose |
| --- | --- | --- |
| `backend/.env` | `GEMINI_API_KEY` | Google Gemini API key (required) |
| `backend/.env` | `GEMINI_MODEL` | Defaults to `gemini-3.1-flash-lite` |
| `backend/.env` | `FRONTEND_ORIGIN` | Comma-separated CORS origins, default `http://localhost:3000` |
| `backend/.env` | `TESSERACT_CMD` | Optional path to Tesseract on Windows |
| `backend/.env` | `DATABASE_PATH` | Optional SQLite path override |
| `backend/.env` | `PORT`, `FLASK_DEBUG` | Optional server settings |
| `frontend/.env` | `VITE_API_URL` | Backend base URL, default `http://localhost:5000` |
| `frontend/.env` | `VITE_API_MODE` | `auto` / `live` / `demo` |

**Never commit `.env` files or real API keys.** Only `.env.example` files belong in the repo.
The key supplied for local development is in `backend/.env`, which is git-ignored. If this repo is
already public, rotate that key in Google AI Studio before pushing.

---

## API endpoints

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Service health check |
| POST | `/api/care-plan` | multipart: `file`, `language`, optional `capture_context` → structured care plan + `session_id` |
| POST | `/api/verify` | JSON: `session_id`, `patient_response`, `language` → comprehension comparison |
| POST | `/api/clarification-slip` | JSON: `session_id`, `questions` → printable PDF |
| POST | `/api/mobile-context` | JSON: optional motion/light/noise/permission signals → capture tips |

The frontend adapter (`frontend/src/services/api.js`) converts the backend's `care_cards`,
`unclear_items`, `follow_up_text` and `urgent_warning_text` into the shape rendered by the care
plan, and converts `/api/verify` statuses into the aligned/mismatch feedback UI.

---

## Pushing to GitHub

### Option A — GitHub CLI

```powershell
cd C:\Users\S.DUTTA\LiveBridge-1.0
git init
git add .
git commit -m "Initial LiveBridge AI 1.0 integration"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### Option B — GitHub Desktop

1. Open GitHub Desktop → **File → Add local repository**.
2. Choose `C:\Users\S.DUTTA\LiveBridge-1.0`.
3. Review changes, confirm no `.env` or `.db` files are listed, write a commit message, then
   **Commit to main**.
4. Click **Publish repository** and choose your GitHub account/repository name.

Before the first push, verify that secrets are ignored:

```powershell
git check-ignore -v backend\.env backend\database\healthbridge.db frontend\.env
```

---

## Notes

- `backend/database/healthbridge.db` is created automatically by `init_db()` on first run.
- Uploaded documents are removed after processing; generated PDFs stay in `backend/generated/`.
- Add authentication, encryption, retention controls and consent before any real deployment.
