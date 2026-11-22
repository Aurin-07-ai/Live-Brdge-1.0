import os
import pytesseract
from PIL import Image
import fitz  # PyMuPDF

# Windows: if Tesseract is not on PATH, set TESSERACT_CMD in .env
if os.getenv("TESSERACT_CMD"):
    pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD")

def extract_text_from_file(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        doc = fitz.open(path)
        extracted = "\n".join(page.get_text("text") for page in doc).strip()
        if extracted:
            return extracted
        # Scanned PDF: render pages then OCR
        chunks = []
        for page in doc:
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            chunks.append(pytesseract.image_to_string(img, lang="eng+hin"))
        return "\n".join(chunks).strip()
    if ext in {".png", ".jpg", ".jpeg", ".webp"}:
        img = Image.open(path).convert("RGB")
        return pytesseract.image_to_string(img, lang="eng+hin").strip()
    raise ValueError("Unsupported file format")
