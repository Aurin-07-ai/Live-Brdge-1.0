# Kept as a separate module so verification logic can later be tested or swapped.
from gemini_service import verify_understanding as _verify

def verify_understanding(source_text, care_plan, patient_response, language="English"):
    if not patient_response or not patient_response.strip():
        return {
            "status": "needs_clarification",
            "observed_mismatches": [],
            "matched_points": [],
            "questions_for_clinician": ["Please explain in your own words what you understood."],
            "patient_friendly_feedback": "I need your explanation to compare it with the document."
        }
    return _verify(source_text, care_plan, patient_response.strip(), language)
