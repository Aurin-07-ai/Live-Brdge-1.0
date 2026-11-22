import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from ocr import extract_text_from_file
from gemini_service import create_care_plan
from verification import verify_understanding
from database import init_db, save_session, get_session
from pdf_slip import create_clarification_pdf
from mobile_context import assess_capture_context

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [o.strip() for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").split(",")]}})
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024
ALLOWED = {"png", "jpg", "jpeg", "webp", "pdf"}

init_db()

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "LiveBridge AI backend"})

@app.post("/api/mobile-context")
def mobile_context():
    """Assess optional phone capture signals and return practical capture tips."""
    data = request.get_json(silent=True) or {}
    context = data.get("context", data)
    if not isinstance(context, dict):
        return jsonify({"error": "context must be a JSON object."}), 400
    return jsonify(assess_capture_context(context))

@app.post("/api/care-plan")
def care_plan():
    if "file" not in request.files:
        return jsonify({"error": "Upload a document using the 'file' field."}), 400
    file = request.files["file"]
    if not file.filename or not allowed_file(file.filename):
        return jsonify({"error": "Supported formats: PDF, PNG, JPG, JPEG, WEBP."}), 400

    language = request.form.get("language", "English")
    if language not in {"English", "Hindi", "Punjabi"}:
        return jsonify({"error": "Choose English, Hindi, or Punjabi."}), 400

    safe_name = secure_filename(file.filename)
    temp_path = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(temp_path, exist_ok=True)
    path = os.path.join(temp_path, safe_name)
    try:
        file.save(path)
        source_text = extract_text_from_file(path)
        if not source_text.strip():
            return jsonify({"error": "No readable text found. Try a clearer scan or image."}), 422

        result = create_care_plan(source_text, language)
        # Optional phone sensor context can help the frontend guide a better scan.
        raw_context = request.form.get("capture_context")
        if raw_context:
            try:
                import json
                result["capture_assessment"] = assess_capture_context(json.loads(raw_context))
            except (ValueError, TypeError):
                result["capture_assessment"] = {"status": "unknown", "tips": ["Capture context was not valid JSON; continue with the document result."], "signals": {}}
        session_id = save_session(safe_name, language, source_text, result)
        result["session_id"] = session_id
        result["notice"] = (
            "For understanding and communication only. Confirm all medication and care "
            "instructions with your clinician. Do not rely on this output for treatment decisions."
        )
        return jsonify(result)
    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 503
    except Exception:
        app.logger.exception("Care plan generation failed")
        return jsonify({"error": "Could not process the document. Check server logs and try again."}), 500
    finally:
        try:
            if os.path.exists(path):
                os.remove(path)
        except OSError:
            pass

@app.post("/api/verify")
def verify():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    patient_response = data.get("patient_response", "").strip()
    language = data.get("language", "English")
    if not session_id or not patient_response:
        return jsonify({"error": "session_id and patient_response are required."}), 400
    record = get_session(session_id)
    if not record:
        return jsonify({"error": "Session not found. Please upload the document again."}), 404
    result = verify_understanding(record["source_text"], record["care_plan"], patient_response, language)
    return jsonify(result)

@app.post("/api/clarification-slip")
def clarification_slip():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    questions = data.get("questions", [])
    if not session_id:
        return jsonify({"error": "session_id is required."}), 400
    record = get_session(session_id)
    if not record:
        return jsonify({"error": "Session not found."}), 404
    if not isinstance(questions, list):
        return jsonify({"error": "questions must be a list."}), 400
    pdf_path = create_clarification_pdf(record["filename"], questions)
    return send_file(pdf_path, as_attachment=True, download_name="HealthBridge_Doctor_Clarification_Slip.pdf")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
