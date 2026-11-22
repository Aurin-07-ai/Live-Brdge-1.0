"""Privacy-conscious assessment of phone capture conditions for LiveBridge AI."""

def assess_capture_context(context):
    if not isinstance(context, dict):
        return {"status": "unknown", "tips": [], "signals": {}}

    tips = []
    signals = {}

    # Values are optional client-provided measurements; never infer clinical risk.
    motion = context.get("motion_score")
    if isinstance(motion, (int, float)):
        signals["motion_score"] = round(float(motion), 3)
        if motion > 0.65:
            tips.append("Phone movement was high. Hold the phone steady and recapture the document.")

    light = context.get("ambient_light_lux")
    if isinstance(light, (int, float)):
        signals["ambient_light_lux"] = max(0, round(float(light), 1))
        if light < 80:
            tips.append("Lighting appears low. Move to a brighter place before scanning.")

    noise = context.get("ambient_noise_db")
    if isinstance(noise, (int, float)):
        signals["ambient_noise_db"] = round(float(noise), 1)
        if noise > 65:
            tips.append("Background noise may affect voice capture. Try a quieter place or speak closer to the phone.")

    if context.get("camera_permission") is False:
        tips.append("Camera permission is off. You can upload an existing document image instead.")
    if context.get("microphone_permission") is False:
        tips.append("Microphone permission is off. You can type your explanation instead.")

    return {
        "status": "needs_better_capture" if tips else "capture_ready",
        "tips": tips,
        "signals": signals,
        "privacy_note": "Raw sensor readings and precise location are not required or stored by this assessment."
    }
