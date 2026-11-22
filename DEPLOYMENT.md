# Deploying LiveBridge AI (Vercel frontend + Render backend)

The app is a monorepo: `frontend/` is a Vite/React site, `backend/` is a Flask API.
GitHub repo: `https://github.com/Aurin-07-ai/Live-Brdge-1.0.git` (branch `main`).

You will end up with:

| Piece | Platform | URL shape |
| --- | --- | --- |
| React app | Vercel | `https://<project>.vercel.app` |
| Flask API | Render | `https://<service>.onrender.com` |

> ⚠️ Before pushing: `backend/.env` contains a real-looking Gemini API key. It is git-ignored,
> so it will not be pushed, but set the key in Render's dashboard and rotate the old one in
> Google AI Studio if this repo was ever public. Never commit `.env`, `.db`, uploads, or PDFs.

---

## 0. Push the deployment config to GitHub

On this Windows machine `git` is installed but not on `PATH`. Use the full path (or add
`C:\Program Files\Git\cmd` to your `PATH` first):

```powershell
$git = 'C:\Program Files\Git\cmd\git.exe'
Set-Location C:\Users\S.DUTTA\LiveBridge-1.0

& $git check-ignore -v backend\.env frontend\.env backend\database\healthbridge.db   # should list all three
& $git status --short
& $git add .
& $git commit -m "Add Vercel and Render deployment config"
& $git push origin main
```

---

## 1. Deploy the backend on Render (do this first)

### Option A — Blueprint (recommended, uses the committed `render.yaml`)

1. Sign in at <https://dashboard.render.com> → **Blueprints** → **New Blueprint Instance**.
2. Connect GitHub and select `Live-Brdge-1.0`, branch `main`.
3. Give the Blueprint a name and click **Apply**.
4. Render will prompt for two values declared with `sync: false`:
   - `GEMINI_API_KEY` → paste the key from your local `backend/.env`.
   - `FRONTEND_ORIGIN` → put `http://localhost:3000` for now; replace it with the Vercel URL in step 3.
5. Wait for the first build to finish (the Blueprint already installs Tesseract + Python deps,
   starts gunicorn with a 180 s timeout, and sets `/api/health` as the health check).
6. Copy the service URL, e.g. `https://livebridge-backend.onrender.com`.

### Option B — Manual web service

**New → Web Service** → connect the same repo → `main`, then:

| Field | Value |
| --- | --- |
| Language / Runtime | Python 3 |
| Root Directory | `backend` (Settings → Build & Deploy → Root Directory) |
| Build Command | `apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin && pip install -r requirements.txt` |
| Start Command | `gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 180 --graceful-timeout 180 app:app` |
| Health Check Path | `/api/health` |
| Plan | Free (adequate for a demo) |

Environment variables (Environment tab):

| Key | Value |
| --- | --- |
| `GEMINI_API_KEY` | your real key |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `FRONTEND_ORIGIN` | `http://localhost:3000` (update later) |
| `WEB_CONCURRENCY` | `1` |
| `PYTHON_VERSION` | `3.12.10` |

### Verify the backend

Open `https://<service>.onrender.com/api/health` — you should see:

```json
{"service":"LiveBridge AI backend","status":"ok"}
```

If the build fails on `apt-get` with a permission error, change the two `apt-get` calls in the
build command to `sudo apt-get ...` (or use a Docker runtime on Render).

---

## 2. Deploy the frontend on Vercel

1. Go to <https://vercel.com/new> → **Import Git Repository** → select `Live-Brdge-1.0`.
2. Click **Edit** next to **Root Directory** and choose `frontend`.
3. Framework Preset should be **Vite**; Build Command `npm run build`; Output Directory `dist`.
4. Add Environment Variables **before** the first build:

   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://<service>.onrender.com` (no `/api`, no trailing slash) |
   | `VITE_API_MODE` | `live` |

   `live` matters: on the Render free plan a sleeping service can take ~50 s to wake, and the
   frontend's 2.5 s health probe in `auto` mode would silently switch to demo data.

5. Click **Deploy**. Your site is live at `https://<project>.vercel.app`.
6. If you added the env vars after the first deploy, go to **Deployments → … → Redeploy**
   (Vite bakes `VITE_*` values into the JS at build time).

`frontend/vercel.json` adds the SPA rewrite so direct visits to `/upload`, `/care-plan`,
`/doctor-panel`, etc. load `index.html` instead of 404-ing.

---

## 3. Connect the two (CORS)

Render only accepts browser requests from origins listed in `FRONTEND_ORIGIN`.

1. Render dashboard → your backend service → **Environment**.
2. Set `FRONTEND_ORIGIN` to the exact Vercel origin, no trailing slash:

   ```text
   https://<project>.vercel.app
   ```

   Multiple origins are comma-separated, e.g.
   `https://<project>.vercel.app,https://livebridge-xyz.vercel.app,https://care.example.com`.
3. Save. Render redeploys automatically; wait until it is **Live**.
4. Open the Vercel URL, upload a sample discharge summary, and check:
   - Browser DevTools → Network: `POST https://<service>.onrender.com/api/care-plan` → **200**.
   - Console: no `Access-Control-Allow-Origin` errors.
   - `/api/health` in the network tab returns ok.

Auto-deploy is now wired: every `git push origin main` rebuilds both the Vercel site and the
Render service.

---

## 4. Things that will otherwise surprise you

- **Free Render services sleep after inactivity.** The first request after a quiet period can
  take ~50 s. The frontend allows 120 s for generation, so it works, but users should know.
- **SQLite is on an ephemeral filesystem.** `database/healthbridge.db` and
  `generated/*.pdf` disappear on redeploy/restart. For a demo that is fine. For persistence,
  attach a Render persistent disk, mount it at `/data`, and set `DATABASE_PATH=/data/healthbridge.db`.
- **Tesseract is a system binary.** It is installed in the Render build command, including the
  Hindi traineddata (`tesseract-ocr-hin`) used by `ocr.py`. Locally on Windows, set
  `TESSERACT_CMD` in `backend/.env`.
- **Upload limit** is 12 MB (`MAX_CONTENT_LENGTH` in `app.py`).
- **Not a medical product.** Add authentication, encryption, retention controls and consent
  before exposing this to real patient records. Do not upload real documents to a demo deploy.

---

## 5. Quick troubleshooting

| Symptom | Fix |
| --- | --- |
| `405`/CORS error in browser | `FRONTEND_ORIGIN` must exactly match the Vercel origin; save and wait for redeploy. |
| Frontend shows demo data instead of results | Set `VITE_API_MODE=live` in Vercel and redeploy. |
| `Failed to fetch` / 502 | Backend asleep or crashed — check Render Logs; hit `/api/health`. |
| `ModuleNotFoundError` on Render | Root Directory must be `backend`; requirements must include `gunicorn`. |
| `TesseractNotFoundError` | Build command must install `tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin`. |
| Worker timeout / 502 during upload | Keep `--timeout 180` in the gunicorn start command. |
| Vercel `/upload` gives 404 | `frontend/vercel.json` must be committed and Root Directory set to `frontend`. |
| API key errors on `/api/care-plan` | Set `GEMINI_API_KEY` in Render Environment (not in Git) and redeploy. |
