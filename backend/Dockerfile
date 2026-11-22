FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Tesseract is a system binary; include English and Hindi traineddata.
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
RUN mkdir -p uploads database generated

EXPOSE 10000

# Render provides PORT (10000 by default). gthread keeps /api/health responsive
# while a worker is busy with OCR + Gemini, so Render does not kill the instance.
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-10000} --worker-class gthread --workers 1 --threads 4 --timeout 180 --graceful-timeout 180 app:app"]
