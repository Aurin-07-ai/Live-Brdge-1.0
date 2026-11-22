/**
 * LiveBridge AI - API service layer
 *
 * Talks to the Flask backend in ../backend over the real /api routes.
 * VITE_API_MODE:
 *   auto (default) - use the backend when it is reachable, otherwise use demo data
 *   live           - always use the backend and surface errors
 *   demo           - always use the built-in interactive demo
 */

const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = `${RAW_BASE_URL.replace(/\/+$/, '')}/api`;
export const API_MODE = (import.meta.env.VITE_API_MODE || 'auto').toLowerCase();

const HEALTH_TIMEOUT_MS = 2500;
const GENERATE_TIMEOUT_MS = 120000;

export class BackendUnavailableError extends Error {
  constructor(message = 'The LiveBridge backend is not reachable.') {
    super(message);
    this.name = 'BackendUnavailableError';
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new BackendUnavailableError('The request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function readError(response, fallback) {
  const data = await response.json().catch(() => null);
  return new Error(data?.error || data?.message || `${fallback} (HTTP ${response.status})`);
}

export const apiService = {
  /** GET /api/health - returns null when the backend is offline. */
  async health(timeoutMs = HEALTH_TIMEOUT_MS) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {}, timeoutMs);
      if (!response.ok) return null;
      const data = await response.json().catch(() => null);
      return data?.status === 'ok' ? data : null;
    } catch {
      return null;
    }
  },

  /** Decide whether this session should call the live backend. */
  async shouldUseBackend() {
    if (API_MODE === 'demo') return false;
    if (API_MODE === 'live') return true;
    return (await this.health()) !== null;
  },

  /** POST /api/care-plan (multipart/form-data) */
  async generateCarePlan({ file, language = 'English', captureContext = null } = {}) {
    if (!file) throw new Error('Please choose a document first.');
    const form = new FormData();
    form.append('file', file);
    form.append('language', language);
    if (captureContext) {
      form.append(
        'capture_context',
        typeof captureContext === 'string' ? captureContext : JSON.stringify(captureContext)
      );
    }
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/care-plan`,
      { method: 'POST', body: form },
      GENERATE_TIMEOUT_MS
    );
    if (!response.ok) throw await readError(response, 'Could not process the document.');
    return response.json();
  },

  /** POST /api/verify */
  async verifyUnderstanding({ sessionId, patientResponse, language = 'English' }) {
    if (!sessionId) throw new Error('Missing session id. Please upload the document again.');
    const response = await fetchWithTimeout(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        patient_response: patientResponse,
        language,
      }),
    });
    if (!response.ok) throw await readError(response, 'Could not evaluate the answer.');
    return response.json();
  },

  /** POST /api/clarification-slip - returns a PDF Blob. */
  async downloadClarificationSlip({ sessionId, questions = [] }) {
    if (!sessionId) throw new Error('Missing session id. Please upload the document again.');
    const response = await fetchWithTimeout(`${API_BASE_URL}/clarification-slip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, questions }),
    });
    if (!response.ok) throw await readError(response, 'Could not generate the PDF slip.');
    return response.blob();
  },

  /** POST /api/mobile-context - optional capture-quality tips. */
  async getCaptureTips(context) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/mobile-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });
    if (!response.ok) throw await readError(response, 'Could not assess capture context.');
    return response.json();
  },
};

/**
 * Convert the Flask/Gemini response into the shape the React care-plan UI renders.
 * Fallback values are only used for sections the backend does not provide.
 */
export function mapBackendCarePlan(result, patient, fallback = {}) {
  const base = JSON.parse(JSON.stringify(fallback || {}));
  const cards = Array.isArray(result?.care_cards) ? result.care_cards : [];
  const stamp = Date.now();

  const medicines = cards.length
    ? cards.map((card, index) => {
        const unclear = Boolean(card.needs_clinician_confirmation);
        const category = String(card.category || `Care item ${index + 1}`);
        return {
          id: `ai-med-${index}-${stamp}`,
          name: category,
          dose: '',
          timing: '',
          instructions: String(card.plain_language || card.original_text || 'See the original document.'),
          source: String(card.original_text || 'Extracted from the uploaded document'),
          icon: 'pill',
          isUnclear: unclear,
          warningTag: unclear ? 'Needs clinician confirmation' : null,
          warningDetail: unclear
            ? 'This instruction was flagged as unclear. Confirm it with your clinician before acting.'
            : null,
          resolved: false,
          doctorClarified: false,
          category,
          linkedReportId: null,
        };
      })
    : base.medicines || [];

  const homecare = cards.length
    ? cards
        .filter((card) => !/medic|dose|tablet|pill/i.test(String(card.category || '')))
        .map((card, index) => ({
          id: `ai-home-${index}-${stamp}`,
          instruction: String(card.plain_language || card.original_text || ''),
          category: 'care',
          source: String(card.original_text || 'Uploaded document'),
        }))
    : base.homecare || [];

  const importantInstructions = result?.urgent_warning_text
    ? [
        {
          id: `ai-urgent-${stamp}`,
          text: String(result.urgent_warning_text),
          urgency: 'high',
          source: 'Uploaded document',
        },
      ]
    : [];

  const todayChecklist = cards.length
    ? cards.slice(0, 6).map((card, index) => ({
        id: `ai-task-${index}-${stamp}`,
        text: String(card.plain_language || card.original_text || ''),
        time: 'Today',
      }))
    : base.todayChecklist || [];

  const understandingQuestions = cards.length
    ? cards.map((card, index) => {
        const instruction = String(card.plain_language || card.original_text || '');
        const keywords = [...new Set(instruction.toLowerCase().match(/[a-z0-9]{4,}/g) || [])].slice(0, 8);
        return {
          id: `ai-q-${index}-${stamp}`,
          relatedMedicineId: null,
          title: String(card.category || `Instruction ${index + 1}`),
          question: `In your own words, what did the document say about ${
            card.category || 'this instruction'
          }?`,
          instruction,
          source: String(card.original_text || 'Uploaded document'),
          sampleCorrect: instruction || 'Follow the instruction in the document',
          sampleMismatch: 'I am not sure, I will decide later',
          keywords,
          mismatchKeywords: ['not sure', 'dont know', "don't know", 'skip', 'stop taking'],
          alignedExplanation: 'That sounds right. This matches the instruction in your document.',
          mismatchExplanation:
            'Let us review this instruction together and confirm it with your clinician before acting.',
        };
      })
    : base.understandingQuestions || [];

  const followUp = { ...(base.followUp || {}) };
  if (result?.follow_up_text) followUp.notes = String(result.follow_up_text);
  if (patient?.doctor) followUp.doctor = patient.doctor;

  return {
    ...base,
    summary: result?.summary || '',
    notice: result?.notice || '',
    captureAssessment: result?.capture_assessment || null,
    medicines,
    homecare,
    importantInstructions,
    todayChecklist,
    understandingQuestions,
    followUp,
  };
}

/** Build doctor-slip questions from backend-flagged unclear items. */
export function mapUnclearItems(items = [], fallback = []) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const stamp = Date.now();
  return items.map((item, index) => ({
    id: `ai-unclear-${index}-${stamp}`,
    question: `Please confirm this unclear instruction: ${String(item)}`,
    relatedInstruction: String(item),
    source: 'Flagged during document extraction',
    category: 'unclear-smudged',
    isAmberWarning: true,
    createdAt: new Date().toISOString(),
    answered: false,
    doctorNotes: '',
    status: 'Pending Doctor Clarification',
    doctorAnswer: null,
  }));
}

/** Interpret /api/verify for the two-state feedback UI. */
export function interpretVerification(result) {
  const status = String(result?.status || '').toLowerCase();
  const aligned = status === 'no_obvious_mismatch';
  return {
    aligned,
    feedback:
      result?.patient_friendly_feedback ||
      (aligned
        ? 'That sounds right! Your answer matches the document.'
        : "Let's review this instruction together and confirm it with your clinician."),
    questions: Array.isArray(result?.questions_for_clinician)
      ? result.questions_for_clinician
      : [],
  };
}

export const LANGUAGE_TO_BACKEND = { en: 'English', hi: 'Hindi', pa: 'Punjabi' };
export const backendLanguage = (code) => LANGUAGE_TO_BACKEND[code] || 'English';
