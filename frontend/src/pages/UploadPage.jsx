import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';
import { DEMO_PATIENT, DEMO_CARE_PLAN, DEFAULT_DOCTOR_QUESTIONS } from '../data/demoData';
import {
  apiService,
  backendLanguage,
  mapBackendCarePlan,
  mapUnclearItems,
} from '../services/api';
import { t } from '../data/translations';

const STEPS = [
  'Reading your document...',
  'Organizing your instructions...',
  'Preparing your care plan...',
];

export default function UploadPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { language } = state;

  const [phase, setPhase] = useState('idle'); // 'idle' | 'processing' | 'done'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [apiError, setApiError] = useState('');

  const forceDemoRef = useRef(false);
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // ─── Processing: real backend call with animated progress + demo fallback ──
  useEffect(() => {
    if (phase !== 'processing') return;

    let cancelled = false;
    const timers = [];
    const minDisplay = new Promise((resolve) => {
      timers.push(setTimeout(resolve, 2200));
    });

    setCurrentStep(0);
    setProgress(15);
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setCompletedSteps([0]);
        setCurrentStep(1);
        setProgress(55);
      }, 700)
    );
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setCompletedSteps([0, 1]);
        setCurrentStep(2);
        setProgress(85);
      }, 1400)
    );

    const buildResult = async () => {
      if (forceDemoRef.current) return null;
      try {
        const useBackend = await apiService.shouldUseBackend();
        if (!useBackend) return null;

        const result = await apiService.generateCarePlan({
          file: selectedFile,
          language: backendLanguage(language),
        });
        return {
          carePlan: mapBackendCarePlan(result, state.patient, DEMO_CARE_PLAN),
          doctorQuestions: mapUnclearItems(result.unclear_items),
          sessionId: result.session_id || null,
          notice: result.notice || null,
        };
      } catch (err) {
        console.warn('Backend request failed; falling back to demo data.', err);
        return { error: err.message || 'The backend request failed.' };
      }
    };

    Promise.all([buildResult(), minDisplay])
      .then(([result]) => {
        if (cancelled) return;

        if (result?.error) {
          setApiError(result.error);
          dispatch({
            type: Actions.SET_UPLOAD_NOTICE,
            payload: `${result.error} Showing the interactive demo instead.`,
          });
        } else if (result) {
          dispatch({ type: Actions.SET_SESSION_ID, payload: result.sessionId });
          dispatch({ type: Actions.SET_API_SOURCE, payload: 'backend' });
          dispatch({ type: Actions.SET_DEMO_MODE, payload: false });
          dispatch({ type: Actions.SET_UPLOAD_NOTICE, payload: result.notice });
          dispatch({ type: Actions.SET_CARE_PLAN, payload: result.carePlan });
          dispatch({ type: Actions.SET_DOCTOR_QUESTIONS, payload: result.doctorQuestions });

          const stamp = Date.now();
          dispatch({
            type: Actions.SET_MEDICAL_REPORTS,
            payload: [
              {
                id: `rep-ai-${stamp}`,
                title: 'Uploaded Hospital Document',
                category: 'Discharge Summary',
                date: new Date().toISOString().split('T')[0],
                doctor: state.patient?.doctor || 'Attending Physician',
                hospital: state.patient?.hospital || 'Hospital Care Center',
                pages: 1,
                status: 'Active · AI Extracted',
                extractedItemsCount: result.carePlan.medicines?.length || 0,
                rotation: 0,
                verifiedByDoctor: false,
                summary: result.carePlan.summary || 'Document processed by the LiveBridge backend.',
                highlights: (result.carePlan.medicines || []).map((m) => m.instructions).slice(0, 5),
                sourceFile: selectedFile?.name || 'Uploaded_Document.pdf',
                extractedMedicines: (result.carePlan.medicines || []).map((m) => m.id),
              },
            ],
          });
        }

        if (!result || result.error) {
          dispatch({
            type: Actions.SET_PATIENT,
            payload: { ...DEMO_PATIENT, name: state.patient?.name || DEMO_PATIENT.name },
          });
          dispatch({
            type: Actions.SET_CARE_PLAN,
            payload: JSON.parse(JSON.stringify(DEMO_CARE_PLAN)),
          });
          dispatch({ type: Actions.SET_SESSION_ID, payload: null });
          dispatch({ type: Actions.SET_API_SOURCE, payload: 'demo' });
          dispatch({ type: Actions.SET_DEMO_MODE, payload: true });
          if (!result && state.doctorQuestions.length === 0) {
            DEFAULT_DOCTOR_QUESTIONS.forEach((q) => {
              dispatch({ type: Actions.ADD_DOCTOR_QUESTION, payload: q });
            });
          }
        }

        setCompletedSteps([0, 1, 2]);
        setProgress(100);
        setPhase('done');
        timers.push(setTimeout(() => navigate('/care-plan'), 1200));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Unexpected processing error:', err);
        setApiError('Something went wrong while processing the document.');
      });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [phase, navigate, dispatch]);

  const handleFileSelected = (file) => {
    if (!file) return;
    forceDemoRef.current = false;
    setApiError('');
    setSelectedFile(file);
    setPhase('processing');
  };

  const handleSampleReport = () => {
    forceDemoRef.current = true;
    setApiError('');
    dispatch({ type: Actions.SET_API_SOURCE, payload: 'demo' });
    dispatch({ type: Actions.SET_UPLOAD_NOTICE, payload: 'Sample report uses the built-in interactive demo.' });
    dispatch({ type: Actions.SET_DEMO_MODE, payload: true });
    setSelectedFile({
      name: 'Metro_Hospital_Discharge_Summary_Mrs_Shanti_Verma.pdf',
      size: 428000,
      type: 'application/pdf',
    });
    setPhase('processing');
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-alabaster min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Main Card */}
        <div className="bg-ivory rounded-3xl p-8 sm:p-12 border-2 border-slate-border/80 shadow-card space-y-8">
          {/* Headline & Subheading */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-eucalyptus flex items-center justify-center text-brand-teal mx-auto shadow-xs">
              <Upload size={32} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
              {t(language, 'upload', 'title')}
            </h1>
            <p className="text-xl text-slate-warm max-w-xl mx-auto">
              {t(language, 'upload', 'subtitle')}
            </p>
          </div>

          {phase === 'idle' && (
            <div className="space-y-8">
              {/* Drag and Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-3xl border-3 border-dashed p-8 sm:p-12 text-center transition-all ${
                  isDragOver
                    ? 'border-brand-teal bg-brand-teal-soft scale-[1.01]'
                    : 'border-slate-border bg-alabaster/60 hover:border-brand-teal/50 hover:bg-brand-teal-soft/30'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-teal mx-auto mb-4">
                  <FileText size={32} />
                </div>
                <h2 className="text-2xl font-bold text-charcoal mb-2">
                  {t(language, 'upload', 'dropTitle')}
                </h2>
                <p className="text-slate-warm text-base mb-6">
                  {t(language, 'upload', 'dropSubtitle')}
                </p>

                {/* Hidden Native File Inputs */}
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e.target.files[0])}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e.target.files[0])}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e.target.files[0])}
                />

                {/* Upload Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="min-h-[52px] px-4 py-3 rounded-xl bg-white border-2 border-brand-teal text-brand-teal font-extrabold text-base hover:bg-brand-teal hover:text-white transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    <span>Upload PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="min-h-[52px] px-4 py-3 rounded-xl bg-white border-2 border-brand-teal text-brand-teal font-extrabold text-base hover:bg-brand-teal hover:text-white transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <ImageIcon size={18} />
                    <span>Upload Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="min-h-[52px] px-4 py-3 rounded-xl bg-white border-2 border-brand-teal text-brand-teal font-extrabold text-base hover:bg-brand-teal hover:text-white transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <Camera size={18} />
                    <span>Take a Photo</span>
                  </button>
                </div>
              </div>

              {/* Sample Document Section (Hackathon Judge Experience) */}
              <div className="p-6 rounded-2xl bg-amber-light border-2 border-amber-warning/40 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-warning/20 flex items-center justify-center flex-shrink-0 text-amber-dark">
                    <Sparkles size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-extrabold text-charcoal">
                      {t(language, 'upload', 'trySample')}
                    </h2>
                    <p className="text-base text-slate-warm mt-1">
                      {t(language, 'upload', 'sampleDesc')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSampleReport}
                  className="w-full min-h-[56px] px-6 py-3.5 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover active:scale-[0.99] font-extrabold text-lg shadow-card transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  <span>Start with Sample Hospital Report</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Processing Animation Phase */}
          {(phase === 'processing' || phase === 'done') && (
            <div className="py-8 space-y-8 animate-fade-in text-center max-w-lg mx-auto">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                  {phase === 'done' ? 'Care Plan Ready!' : t(language, 'upload', 'processingTitle')}
                </h2>
                {selectedFile && (
                  <p className="text-sm font-semibold text-slate-warm">
                    Processing: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Smooth Progress Bar */}
              <div className="w-full bg-slate-border/60 rounded-full h-4 overflow-hidden p-0.5">
                <div
                  className="bg-brand-teal h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {apiError && (
                <p className="text-sm font-semibold text-terracotta bg-terracotta-light/60 border border-terracotta/40 rounded-xl px-4 py-3">
                  {apiError} Continuing with the interactive demo.
                </p>
              )}

              {/* 3 Steps list */}
              <div className="space-y-4 text-left">
                {STEPS.map((stepText, idx) => {
                  const isDone = completedSteps.includes(idx);
                  const isCurrent = currentStep === idx && phase !== 'done';
                  return (
                    <div
                      key={stepText}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        isDone
                          ? 'border-eucalyptus-border bg-eucalyptus/60 text-charcoal'
                          : isCurrent
                          ? 'border-brand-teal bg-brand-teal-soft text-brand-teal font-extrabold scale-[1.01]'
                          : 'border-slate-border/50 bg-alabaster/40 text-slate-warm opacity-60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        {isDone ? (
                          <CheckCircle size={24} className="text-brand-teal" />
                        ) : isCurrent ? (
                          <div className="w-5 h-5 border-3 border-brand-teal border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-sm font-bold text-slate-warm">{idx + 1}</span>
                        )}
                      </div>
                      <span className="text-lg font-bold">
                        {idx === 0
                          ? t(language, 'upload', 'step1')
                          : idx === 1
                          ? t(language, 'upload', 'step2')
                          : t(language, 'upload', 'step3')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {phase === 'done' && (
                <div className="pt-2 animate-bounce">
                  <span className="text-base font-extrabold text-brand-teal">
                    Opening your care plan now...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
