import { createContext, useContext, useReducer, useEffect } from 'react';
import {
  DEMO_PATIENTS,
  DEMO_CARE_PLAN,
  INITIAL_MEDICAL_REPORTS,
  DEFAULT_DOCTOR_QUESTIONS,
  INITIAL_COMPREHENSION_TELEMETRY,
} from '../data/demoData';

const STORAGE_KEY = 'livebridge_dynamic_state_v3';

// ─── Initial State Builder ───────────────────────────────────────────────────
function getInitialState() {
  const defaults = {
    language: 'en',              // 'en' | 'hi' | 'pa'
    textSize: 'normal',          // 'normal' | 'large' | 'xlarge'
    simplifiedMode: false,
    demoMode: true,
    portalMode: 'patient',       // 'patient' | 'doctor'
    patients: [...DEMO_PATIENTS],
    activePatientId: DEMO_PATIENTS[0].id,
    patient: { ...DEMO_PATIENTS[0] },
    carePlan: JSON.parse(JSON.stringify(DEMO_CARE_PLAN)),
    medicalReports: [...INITIAL_MEDICAL_REPORTS],
    activeReportId: INITIAL_MEDICAL_REPORTS[0].id,
    doctorQuestions: [...DEFAULT_DOCTOR_QUESTIONS],
    comprehensionTelemetry: [...INITIAL_COMPREHENSION_TELEMETRY],
    completedInstructions: ['t1', 't3'],
    resolvedItems: [],
    speakingId: null,
    // Backend integration state
    sessionId: null,
    apiSource: 'demo',           // 'demo' | 'backend'
    uploadNotice: null,
  };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.warn('Could not load stored state, initializing fresh:', err);
    }
  }

  return defaults;
}

// ─── Action Types ─────────────────────────────────────────────────────────────
export const Actions = {
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_TEXT_SIZE: 'SET_TEXT_SIZE',
  SET_SIMPLIFIED_MODE: 'SET_SIMPLIFIED_MODE',
  SET_DEMO_MODE: 'SET_DEMO_MODE',
  SET_SESSION_ID: 'SET_SESSION_ID',
  SET_API_SOURCE: 'SET_API_SOURCE',
  SET_UPLOAD_NOTICE: 'SET_UPLOAD_NOTICE',
  SET_DOCTOR_QUESTIONS: 'SET_DOCTOR_QUESTIONS',
  SET_MEDICAL_REPORTS: 'SET_MEDICAL_REPORTS',
  SET_PORTAL_MODE: 'SET_PORTAL_MODE',
  SWITCH_PATIENT: 'SWITCH_PATIENT',
  SET_PATIENT: 'SET_PATIENT',
  SET_CARE_PLAN: 'SET_CARE_PLAN',
  SET_SPEAKING_ID: 'SET_SPEAKING_ID',

  // Medical Reports Actions
  ADD_MEDICAL_REPORT: 'ADD_MEDICAL_REPORT',
  UPDATE_REPORT_ROTATION: 'UPDATE_REPORT_ROTATION',
  SET_ACTIVE_REPORT: 'SET_ACTIVE_REPORT',
  DELETE_MEDICAL_REPORT: 'DELETE_MEDICAL_REPORT',

  // Doctor Clarification & Clinical Management
  CLARIFY_PRESCRIPTION_SMUDGE: 'CLARIFY_PRESCRIPTION_SMUDGE',
  ANSWER_DOCTOR_QUESTION: 'ANSWER_DOCTOR_QUESTION',
  ADD_MEDICATION: 'ADD_MEDICATION',
  UPDATE_MEDICATION: 'UPDATE_MEDICATION',
  DELETE_MEDICATION: 'DELETE_MEDICATION',

  // Questions from Patient
  ADD_DOCTOR_QUESTION: 'ADD_DOCTOR_QUESTION',
  REMOVE_DOCTOR_QUESTION: 'REMOVE_DOCTOR_QUESTION',
  EDIT_DOCTOR_QUESTION: 'EDIT_DOCTOR_QUESTION',
  TOGGLE_QUESTION_ANSWERED: 'TOGGLE_QUESTION_ANSWERED',

  // Checklist & Comprehension
  TOGGLE_INSTRUCTION_COMPLETE: 'TOGGLE_INSTRUCTION_COMPLETE',
  MARK_ITEM_RESOLVED: 'MARK_ITEM_RESOLVED',
  LOG_COMPREHENSION_EVENT: 'LOG_COMPREHENSION_EVENT',

  // Reset
  RESET_DEMO_DATA: 'RESET_DEMO_DATA',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  let newState = state;

  switch (action.type) {
    case Actions.SET_LANGUAGE:
      newState = { ...state, language: action.payload };
      break;

    case Actions.SET_TEXT_SIZE:
      newState = { ...state, textSize: action.payload };
      break;

    case Actions.SET_SIMPLIFIED_MODE:
      newState = { ...state, simplifiedMode: action.payload };
      break;

    case Actions.SET_DEMO_MODE:
      newState = { ...state, demoMode: action.payload };
      break;

    case Actions.SET_PORTAL_MODE:
      newState = { ...state, portalMode: action.payload };
      break;

    case Actions.SET_SESSION_ID:
      newState = { ...state, sessionId: action.payload };
      break;

    case Actions.SET_API_SOURCE:
      newState = { ...state, apiSource: action.payload };
      break;

    case Actions.SET_UPLOAD_NOTICE:
      newState = { ...state, uploadNotice: action.payload };
      break;

    case Actions.SET_DOCTOR_QUESTIONS:
      newState = { ...state, doctorQuestions: Array.isArray(action.payload) ? action.payload : [] };
      break;

    case Actions.SET_MEDICAL_REPORTS: {
      const reports = Array.isArray(action.payload) ? action.payload : [];
      newState = {
        ...state,
        medicalReports: reports,
        activeReportId: reports[0]?.id || null,
      };
      break;
    }

    case Actions.SWITCH_PATIENT: {
      const targetId = action.payload;
      const targetPatient = state.patients.find((p) => p.id === targetId) || state.patients[0];
      newState = {
        ...state,
        activePatientId: targetId,
        patient: { ...targetPatient },
      };
      break;
    }

    case Actions.SET_PATIENT:
      newState = {
        ...state,
        patient: action.payload,
        patients: state.patients.map((p) =>
          p.id === (action.payload.id || state.activePatientId) ? { ...p, ...action.payload } : p
        ),
      };
      break;

    case Actions.SET_CARE_PLAN:
      newState = { ...state, carePlan: action.payload };
      break;

    case Actions.SET_SPEAKING_ID:
      newState = { ...state, speakingId: action.payload };
      break;

    // ── Medical Reports ─────────────────────────────────────────────────────
    case Actions.ADD_MEDICAL_REPORT: {
      const newReport = {
        id: `rep-${Date.now()}`,
        title: action.payload.title || 'Uploaded Hospital Document',
        category: action.payload.category || 'Discharge Summary',
        date: action.payload.date || new Date().toISOString().split('T')[0],
        doctor: action.payload.doctor || state.patient?.doctor || 'Attending Physician',
        hospital: action.payload.hospital || state.patient?.hospital || 'Hospital Care Center',
        pages: action.payload.pages || 1,
        status: action.payload.status || 'Active · Extracted',
        extractedItemsCount: action.payload.extractedItemsCount || 2,
        rotation: 0,
        verifiedByDoctor: action.payload.verifiedByDoctor || false,
        summary: action.payload.summary || 'Uploaded document processed and linked to active care plan.',
        highlights: action.payload.highlights || ['New instructions extracted into Care Plan'],
        sourceFile: action.payload.sourceFile || 'Uploaded_Document.pdf',
        extractedMedicines: action.payload.extractedMedicines || [],
      };

      // Also dynamically link any new medicine if provided in payload
      let updatedMedicines = state.carePlan?.medicines || [];
      if (action.payload.newMedicine) {
        updatedMedicines = [
          ...updatedMedicines,
          {
            ...action.payload.newMedicine,
            id: `m-${Date.now()}`,
            linkedReportId: newReport.id,
          },
        ];
      }

      newState = {
        ...state,
        medicalReports: [newReport, ...state.medicalReports],
        activeReportId: newReport.id,
        carePlan: {
          ...state.carePlan,
          medicines: updatedMedicines,
        },
      };
      break;
    }

    case Actions.UPDATE_REPORT_ROTATION: {
      const { id, delta } = action.payload; // delta = 90 or -90
      newState = {
        ...state,
        medicalReports: state.medicalReports.map((r) => {
          if (r.id !== id) return r;
          const nextRotation = ((r.rotation || 0) + delta + 360) % 360;
          return { ...r, rotation: nextRotation };
        }),
      };
      break;
    }

    case Actions.SET_ACTIVE_REPORT:
      newState = { ...state, activeReportId: action.payload };
      break;

    case Actions.DELETE_MEDICAL_REPORT:
      newState = {
        ...state,
        medicalReports: state.medicalReports.filter((r) => r.id !== action.payload),
        activeReportId:
          state.activeReportId === action.payload
            ? state.medicalReports[0]?.id || null
            : state.activeReportId,
      };
      break;

    // ── Doctor Clarifications & Clinical Management ─────────────────────────
    case Actions.CLARIFY_PRESCRIPTION_SMUDGE: {
      const {
        medicineId = 'm4',
        clarifiedTiming = 'Once daily at bedtime (8:00 PM)',
        clarifiedDose = '20 mg',
        doctorNotes = 'Confirmed from hospital record: Take 20mg OD at night for cholesterol reduction.',
        physicianName = 'Dr. Priya Sharma',
      } = action.payload || {};

      // 1. Update medicine in Care Plan
      const updatedMeds = (state.carePlan?.medicines || []).map((med) => {
        if (med.id === medicineId || (medicineId === 'm4' && med.name.includes('Atorvastatin'))) {
          return {
            ...med,
            timing: clarifiedTiming,
            dose: clarifiedDose,
            instructions: `Take 1 tablet (${clarifiedDose}) at bedtime with water. Doctor clarified frequency from carbon record.`,
            isUnclear: false,
            warningTag: null,
            warningDetail: null,
            doctorClarified: true,
            resolved: true,
            source: `Clarified & Signed by ${physicianName} · ${new Date().toLocaleDateString()}`,
          };
        }
        return med;
      });

      // 2. Mark the corresponding doctor question as resolved
      const updatedQuestions = state.doctorQuestions.map((q) => {
        if (q.category === 'unclear-smudged' || q.id === 'dq-smudge-1') {
          return {
            ...q,
            answered: true,
            status: 'Resolved by Physician',
            doctorAnswer: `Prescription Clarified: Take ${clarifiedDose} ${clarifiedTiming}. ${doctorNotes}`,
            doctorNotes: doctorNotes,
          };
        }
        return q;
      });

      newState = {
        ...state,
        carePlan: {
          ...state.carePlan,
          medicines: updatedMeds,
        },
        doctorQuestions: updatedQuestions,
        resolvedItems: Array.from(new Set([...state.resolvedItems, medicineId])),
      };
      break;
    }

    case Actions.ANSWER_DOCTOR_QUESTION: {
      const { id, answerText, doctorNotes } = action.payload;
      newState = {
        ...state,
        doctorQuestions: state.doctorQuestions.map((q) =>
          q.id === id
            ? {
                ...q,
                answered: true,
                status: 'Answered by Doctor',
                doctorAnswer: answerText,
                doctorNotes: doctorNotes || q.doctorNotes,
              }
            : q
        ),
      };
      break;
    }

    case Actions.ADD_MEDICATION: {
      const newMed = {
        id: `m-${Date.now()}`,
        name: action.payload.name,
        dose: action.payload.dose,
        timing: action.payload.timing,
        instructions: action.payload.instructions,
        source: action.payload.source || `Prescribed by Dr. Priya Sharma · ${new Date().toLocaleDateString()}`,
        icon: 'pill',
        isUnclear: false,
        resolved: true,
        doctorClarified: true,
        category: action.payload.category || 'General Care',
        linkedReportId: action.payload.linkedReportId || null,
      };

      newState = {
        ...state,
        carePlan: {
          ...state.carePlan,
          medicines: [...(state.carePlan?.medicines || []), newMed],
        },
      };
      break;
    }

    case Actions.UPDATE_MEDICATION: {
      const updated = action.payload;
      newState = {
        ...state,
        carePlan: {
          ...state.carePlan,
          medicines: (state.carePlan?.medicines || []).map((m) =>
            m.id === updated.id ? { ...m, ...updated, doctorClarified: true } : m
          ),
        },
      };
      break;
    }

    case Actions.DELETE_MEDICATION: {
      newState = {
        ...state,
        carePlan: {
          ...state.carePlan,
          medicines: (state.carePlan?.medicines || []).filter((m) => m.id !== action.payload),
        },
      };
      break;
    }

    // ── Doctor Questions (Patient initiated) ────────────────────────────────
    case Actions.ADD_DOCTOR_QUESTION: {
      const p = action.payload;
      const newQ = typeof p === 'string'
        ? {
            id: `dq-${Date.now()}`,
            question: p,
            relatedInstruction: 'Care instruction clarification',
            source: 'Added by Patient / Family',
            category: 'patient-clarification',
            isAmberWarning: false,
            createdAt: new Date().toISOString(),
            answered: false,
            doctorNotes: '',
            status: 'Pending Doctor Review',
            doctorAnswer: null,
          }
        : {
            id: p.id || `dq-${Date.now()}`,
            question: p.question,
            relatedInstruction: p.relatedInstruction || '',
            source: p.source || 'Care Plan Document',
            category: p.category || 'patient-clarification',
            isAmberWarning: !!p.isAmberWarning,
            createdAt: new Date().toISOString(),
            answered: false,
            doctorNotes: '',
            status: 'Pending Doctor Review',
            doctorAnswer: null,
          };

      // Avoid exact duplicates
      const exists = state.doctorQuestions.some(
        (q) => q.question.toLowerCase() === newQ.question.toLowerCase()
      );
      if (exists) return state;

      newState = {
        ...state,
        doctorQuestions: [newQ, ...state.doctorQuestions],
      };
      break;
    }

    case Actions.REMOVE_DOCTOR_QUESTION:
      newState = {
        ...state,
        doctorQuestions: state.doctorQuestions.filter((q) => q.id !== action.payload),
      };
      break;

    case Actions.EDIT_DOCTOR_QUESTION:
      newState = {
        ...state,
        doctorQuestions: state.doctorQuestions.map((q) =>
          q.id === action.payload.id ? { ...q, question: action.payload.question } : q
        ),
      };
      break;

    case Actions.TOGGLE_QUESTION_ANSWERED:
      newState = {
        ...state,
        doctorQuestions: state.doctorQuestions.map((q) =>
          q.id === action.payload ? { ...q, answered: !q.answered } : q
        ),
      };
      break;

    // ── Checklist & Comprehension ───────────────────────────────────────────
    case Actions.TOGGLE_INSTRUCTION_COMPLETE: {
      const id = action.payload;
      const already = state.completedInstructions.includes(id);
      newState = {
        ...state,
        completedInstructions: already
          ? state.completedInstructions.filter((i) => i !== id)
          : [...state.completedInstructions, id],
      };
      break;
    }

    case Actions.MARK_ITEM_RESOLVED: {
      const itemId = action.payload;
      if (!itemId || state.resolvedItems.includes(itemId)) return state;
      newState = {
        ...state,
        resolvedItems: [...state.resolvedItems, itemId],
      };
      break;
    }

    case Actions.LOG_COMPREHENSION_EVENT: {
      const event = {
        id: `tel-${Date.now()}`,
        timestamp: new Date().toISOString(),
        questionId: action.payload.questionId,
        questionTitle: action.payload.questionTitle,
        patientResponse: action.payload.patientResponse,
        status: action.payload.status, // 'Aligned' | 'Mismatch Flagged'
        resolvedLater: action.payload.resolvedLater || false,
        doctorFlagged: action.payload.doctorFlagged || false,
        clinicalNote: action.payload.clinicalNote || '',
      };
      newState = {
        ...state,
        comprehensionTelemetry: [event, ...state.comprehensionTelemetry],
      };
      break;
    }

    case Actions.RESET_DEMO_DATA: {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return getInitialState();
    }

    default:
      return state;
  }

  // Persist state updates to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (err) {
      console.warn('Could not persist state to localStorage:', err);
    }
  }

  return newState;
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, getInitialState);

  // Sync text size attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', state.textSize);
  }, [state.textSize]);

  // Sync lang attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('lang', state.language);
  }, [state.language]);

  // Sync simplified mode class on body
  useEffect(() => {
    if (state.simplifiedMode) {
      document.body.classList.add('simplified-mode');
    } else {
      document.body.classList.remove('simplified-mode');
    }
  }, [state.simplifiedMode]);

  const value = { state, dispatch };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return ctx;
}
