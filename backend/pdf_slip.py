import os, tempfile
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm

def create_clarification_pdf(filename, questions):
    output_dir = os.path.join(os.path.dirname(__file__), "generated")
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, "clarification_slip.pdf")
    styles = getSampleStyleSheet()
    story = [
        Paragraph("HealthBridge AI — Doctor Clarification Slip", styles["Title"]),
        Spacer(1, 6*mm),
        Paragraph(f"Document: {filename}", styles["Normal"]),
        Spacer(1, 4*mm),
        Paragraph("Please confirm the following items with the treating clinician:", styles["Normal"]),
        Spacer(1, 3*mm)
    ]
    safe_questions = [str(q)[:500] for q in questions if str(q).strip()]
    if not safe_questions:
        safe_questions = ["Please review any unclear or unreadable instructions in the original document."]
    story.append(ListFlowable(
        [ListItem(Paragraph(q.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), styles["Normal"])) for q in safe_questions],
        bulletType="bullet", leftIndent=18
    ))
    story += [Spacer(1, 8*mm), Paragraph("This slip is a communication aid, not a medical recommendation.", styles["Italic"])]
    SimpleDocTemplate(path, pagesize=A4, rightMargin=20*mm, leftMargin=20*mm).build(story)
    return path
