import os, json, re
from google import genai
from google.genai import types

def _client():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise EnvironmentError("GEMINI_API_KEY is missing. Add it to your .env file.")
    return genai.Client(api_key=key)

def _extract_json(text):
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < start:
        raise ValueError("AI did not return valid JSON")
    return json.loads(text[start:end+1])

def create_care_plan(source_text, language="English"):
    prompt = f"""
You are HealthBridge AI, a patient-understanding and doctor-communication assistant.
Return ONLY valid JSON with keys:
summary (string), care_cards (array of objects with category, plain_language,
original_text, needs_clinician_confirmation boolean), unclear_items (array of strings),
follow_up_text (string), urgent_warning_text (string).
Language for plain_language and summary: {language}.
Rules:
- Use only facts explicitly present in the source text.
- Preserve medication names, strengths, frequency, timing, and duration exactly.
- Do not infer missing dosage, route, duration, or appointment date.
- If a medication instruction is unclear, put it in unclear_items and mark the card
  needs_clinician_confirmation=true. Never guess.
- Do not diagnose, recommend new treatment, or change any medical instruction.
- If the source contains emergency instructions, quote/restate them faithfully.
- Each care card's original_text must be a short exact source excerpt where possible.
- If information is absent, say it is not specified in the document.
DOCUMENT TEXT:
{source_text[:18000]}
"""
    response = _client().models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.1, response_mime_type="application/json")
    )
    return _extract_json(response.text)

def verify_understanding(source_text, care_plan, patient_response, language="English"):
    prompt = f"""
Compare a patient's explanation with the uploaded clinician document.
Return ONLY JSON with keys:
status (one of "possible_mismatch", "needs_clarification", "no_obvious_mismatch"),
observed_mismatches (array of strings), matched_points (array of strings),
questions_for_clinician (array of strings), patient_friendly_feedback (string).
Respond in {language}.
Use only source-supported facts. Do not diagnose or tell the patient to change medicine.
Do not mark comprehension as medically validated. A missing detail is "needs_clarification".
Be especially careful with medicine dose/timing and follow-up timing. If mismatch is
possible, gently advise confirming with the clinician before acting.
SOURCE DOCUMENT:
{source_text[:12000]}
CARE PLAN:
{json.dumps(care_plan, ensure_ascii=False)[:8000]}
PATIENT'S OWN EXPLANATION:
{patient_response[:5000]}
"""
    response = _client().models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.1, response_mime_type="application/json")
    )
    return _extract_json(response.text)
