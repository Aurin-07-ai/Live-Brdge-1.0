import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  Volume2,
  MessageSquarePlus,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  HeartHandshake,
} from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';
import { ListenButton } from '../components/ListenButton';
import { t } from '../data/translations';
import { speechService } from '../services/speechService';
import { apiService, backendLanguage, interpretVerification } from '../services/api';
import { DEMO_CARE_PLAN } from '../data/demoData';

export default function UnderstandingCheckPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { language } = state;

  const questions = state.carePlan?.understandingQuestions || DEMO_CARE_PLAN.understandingQuestions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'aligned' | 'mismatch'
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [inputMode, setInputMode] = useState('speak'); // 'speak' | 'type'
  const [addedToDoctor, setAddedToDoctor] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];

  // Reset state when switching questions
  useEffect(() => {
    setUserAnswer('');
    setFeedback(null);
    setFeedbackMessage('');
    setAddedToDoctor(false);
    setIsListening(false);
  }, [currentIndex]);

  // ─── Browser Speech Recognition ─────────────────────────────────────────────
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use the 'Type my answer' tab or the Quick Demo simulation buttons below.");
      setInputMode('type');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN' };
      recognition.lang = langMap[language] || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setUserAnswer(transcript);
        setIsListening(false);
        // Automatically evaluate user speech
        evaluateAnswer(transcript);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
      setIsListening(false);
    }
  };

  // ─── Evaluation Logic: live Gemini verification with local fallback ─────────
  const evaluateAnswer = async (textToEvaluate) => {
    const answer = String(textToEvaluate || userAnswer || '').trim();
    if (!answer || isEvaluating) return;

    // Live backend verification (Samjhao Wapas) when a real session exists.
    if (state.sessionId && state.apiSource === 'backend') {
      setIsEvaluating(true);
      try {
        const result = await apiService.verifyUnderstanding({
          sessionId: state.sessionId,
          patientResponse: answer,
          language: backendLanguage(language),
        });
        const interpreted = interpretVerification(result);

        setFeedback(interpreted.aligned ? 'aligned' : 'mismatch');
        setFeedbackMessage(interpreted.feedback);

        if (interpreted.aligned) {
          if (currentQ.relatedMedicineId) {
            dispatch({ type: Actions.MARK_ITEM_RESOLVED, payload: currentQ.relatedMedicineId });
          }
        } else {
          interpreted.questions.forEach((question, index) => {
            dispatch({
              type: Actions.ADD_DOCTOR_QUESTION,
              payload: {
                id: `ai-verify-${Date.now()}-${index}`,
                question: String(question),
                relatedInstruction: currentQ.instruction,
                source: currentQ.source || 'Samjhao Wapas Check',
                category: 'comprehension-check',
                isAmberWarning: false,
              },
            });
          });
        }

        dispatch({
          type: Actions.LOG_COMPREHENSION_EVENT,
          payload: {
            questionId: currentQ.id,
            questionTitle: currentQ.title,
            patientResponse: answer,
            status: interpreted.aligned ? 'Aligned' : 'Mismatch Flagged',
            resolvedLater: interpreted.aligned,
            doctorFlagged: !interpreted.aligned,
            clinicalNote: `AI verification (${result.status || 'unknown'}): "${answer}".`,
          },
        });
        setIsEvaluating(false);
        return;
      } catch (err) {
        console.warn('Backend verification failed; using local keyword check.', err);
        setIsEvaluating(false);
      }
    }

    // Local demo evaluation (keyword based).
    const text = answer.toLowerCase();
    const keywords = currentQ.keywords || [];
    const mismatchKeywords = currentQ.mismatchKeywords || [];

    const hasMismatchTrigger = mismatchKeywords.some((kw) => text.includes(kw.toLowerCase()));
    const matchedCount = keywords.filter((kw) => text.includes(kw.toLowerCase())).length;

    if (hasMismatchTrigger || (matchedCount === 0 && text.length > 5)) {
      setFeedback('mismatch');
      setFeedbackMessage(
        currentQ.mismatchExplanation ||
          "Let's review this instruction together. Hospital guidelines suggest following the prescribed schedule closely."
      );
      dispatch({
        type: Actions.LOG_COMPREHENSION_EVENT,
        payload: {
          questionId: currentQ.id,
          questionTitle: currentQ.title,
          patientResponse: answer,
          status: 'Mismatch Flagged',
          resolvedLater: false,
          doctorFlagged: true,
          clinicalNote: `Patient misconception detected: "${answer}". Flagged for Doctor Review.`,
        },
      });
    } else {
      setFeedback('aligned');
      setFeedbackMessage(
        currentQ.alignedExplanation ||
          "That sounds right! You understood this instruction clearly."
      );
      if (currentQ.relatedMedicineId) {
        dispatch({ type: Actions.MARK_ITEM_RESOLVED, payload: currentQ.relatedMedicineId });
      }
      dispatch({
        type: Actions.LOG_COMPREHENSION_EVENT,
        payload: {
          questionId: currentQ.id,
          questionTitle: currentQ.title,
          patientResponse: answer,
          status: 'Aligned',
          resolvedLater: true,
          doctorFlagged: false,
          clinicalNote: `Patient answered accurately: "${answer}". Marked Resolved on Care Plan.`,
        },
      });
    }
  };

  const handleSimulateAnswer = (sampleText) => {
    setUserAnswer(sampleText);
    evaluateAnswer(sampleText);
  };

  const handleAddQuestionToDoctorSlip = () => {
    dispatch({
      type: Actions.ADD_DOCTOR_QUESTION,
      payload: {
        id: `dq-samjhao-${currentQ.id}-${Date.now()}`,
        question: `Doctor Clarification needed: ${currentQ.question} (Patient understood: "${userAnswer}")`,
        relatedInstruction: currentQ.instruction,
        source: currentQ.source || 'Samjhao Wapas Check',
        category: 'comprehension-check',
        isAmberWarning: false,
      },
    });
    setAddedToDoctor(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleListenCorrectInstruction = () => {
    speechService.speak(currentQ.instruction, language);
  };

  // ─── Completion Screen ──────────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="bg-alabaster min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto bg-ivory rounded-3xl p-8 sm:p-12 border-2 border-slate-border text-center shadow-card space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-eucalyptus text-brand-teal flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-charcoal">
              {t(language, 'samjhaoWapas', 'completedTitle')}
            </h1>
            <p className="text-xl text-slate-warm leading-relaxed">
              {t(language, 'samjhaoWapas', 'completedDesc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-eucalyptus/50 border border-eucalyptus-border text-left space-y-3">
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <Sparkles size={20} className="text-brand-teal" />
              What happened during this check:
            </h3>
            <ul className="text-base text-slate-warm space-y-2">
              <li className="flex items-center gap-2">
                <Check size={18} className="text-brand-teal flex-shrink-0" />
                <span>Verified instructions now have the green <strong>"Resolved ✓"</strong> badge on your Care Plan.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={18} className="text-brand-teal flex-shrink-0" />
                <span>Any unclear points or questions were automatically saved to your printable <strong>Doctor Clarification Slip</strong>.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/care-plan')}
              className="px-8 py-4 rounded-2xl bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-xl shadow-card transition-all flex items-center justify-center gap-2"
            >
              <span>{t(language, 'samjhaoWapas', 'viewCarePlanBtn')}</span>
              <ArrowRight size={22} />
            </button>

            <button
              onClick={() => navigate('/doctor-questions')}
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-charcoal font-bold text-lg border-2 border-slate-border shadow-xs"
            >
              View Doctor Clarification Slip
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active Question Screen ─────────────────────────────────────────────────
  return (
    <div className="bg-alabaster min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/care-plan')}
            className="inline-flex items-center gap-2 text-slate-warm hover:text-charcoal font-bold text-base transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Care Plan</span>
          </button>

          {/* Progress Indicator */}
          <span className="text-sm font-extrabold text-brand-teal bg-eucalyptus px-3 py-1 rounded-full border border-eucalyptus-border">
            Instruction {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Main Card (Pure Ivory #FFFFFF) */}
        <div className="bg-ivory rounded-3xl p-6 sm:p-10 border-2 border-slate-border/80 shadow-card space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-teal-soft text-brand-teal text-xs font-bold uppercase tracking-wide">
              <HeartHandshake size={16} />
              <span>Samjhao Wapas · {t(language, 'samjhaoWapas', 'badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
              {t(language, 'samjhaoWapas', 'title')}
            </h1>
            <p className="text-xl text-slate-warm leading-relaxed">
              {t(language, 'samjhaoWapas', 'subtitle')}
            </p>
          </div>

          {/* Current Question Box */}
          <div className="p-6 rounded-2xl bg-alabaster border-2 border-brand-teal/20 space-y-3">
            <span className="text-xs font-extrabold text-brand-teal uppercase tracking-wider block">
              {currentQ.title || 'Instruction Check'}
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-charcoal leading-snug">
              {currentQ.question}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-warm font-semibold">
                Source: {currentQ.source}
              </span>
              <button
                onClick={handleListenCorrectInstruction}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-teal hover:underline"
              >
                <Volume2 size={16} />
                <span>Hear the question read aloud</span>
              </button>
            </div>
          </div>

          {/* Response Mode Tabs */}
          <div className="flex rounded-2xl bg-alabaster p-1.5 border border-slate-border">
            <button
              onClick={() => setInputMode('speak')}
              className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-base transition-all flex items-center justify-center gap-2 ${
                inputMode === 'speak'
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-slate-warm hover:text-charcoal'
              }`}
            >
              <Mic size={20} />
              <span>{t(language, 'samjhaoWapas', 'speakTab')}</span>
            </button>

            <button
              onClick={() => setInputMode('type')}
              className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-base transition-all flex items-center justify-center gap-2 ${
                inputMode === 'type'
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-slate-warm hover:text-charcoal'
              }`}
            >
              <span>{t(language, 'samjhaoWapas', 'typeTab')}</span>
            </button>
          </div>

          {/* Input Area: Speak or Type */}
          {inputMode === 'speak' ? (
            <div className="text-center py-6 space-y-4">
              {/* Prominent Microphone Button in Calming Deep Teal #0F6E73 */}
              <button
                onClick={toggleListening}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center mx-auto transition-all duration-300 shadow-card ${
                  isListening
                    ? 'bg-terracotta text-white scale-110 ring-8 ring-terracotta/30 animate-pulse'
                    : 'bg-brand-teal hover:bg-brand-teal-hover text-white active:scale-95'
                }`}
                aria-label={isListening ? 'Stop recording voice' : 'Start speaking your answer'}
              >
                {isListening ? <MicOff size={44} /> : <Mic size={44} />}
              </button>

              <div className="space-y-1">
                <p className="text-lg font-bold text-charcoal">
                  {isListening ? t(language, 'samjhaoWapas', 'listening') : t(language, 'samjhaoWapas', 'micPrompt')}
                </p>
                <p className="text-sm text-slate-warm">
                  Tap microphone to talk. There are no right or wrong words.
                </p>
              </div>

              {userAnswer && (
                <div className="p-4 rounded-2xl bg-alabaster border border-slate-border text-left max-w-lg mx-auto">
                  <span className="text-xs font-bold text-slate-warm block mb-1">We heard:</span>
                  <p className="text-lg font-extrabold text-charcoal italic">"{userAnswer}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label htmlFor="user-type-answer" className="text-sm font-bold text-slate-warm block">
                Type what you understood in your own words:
              </label>
              <textarea
                id="user-type-answer"
                rows={3}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t(language, 'samjhaoWapas', 'typePrompt')}
                className="w-full p-4 rounded-2xl border-2 border-slate-border text-lg font-medium text-charcoal focus:outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/15"
              />
              <button
                onClick={() => evaluateAnswer(userAnswer)}
                disabled={!userAnswer.trim() || isEvaluating}
                className="w-full min-h-[52px] rounded-xl bg-brand-teal text-white font-extrabold text-lg hover:bg-brand-teal-hover transition-all disabled:opacity-50"
              >
                {isEvaluating ? 'Checking your answer…' : t(language, 'samjhaoWapas', 'checkBtn')}
              </button>
            </div>
          )}

          {/* Quick Simulation Buttons for Hackathon Judges */}
          <div className="p-4 rounded-2xl bg-amber-light border border-amber-warning/40 space-y-2">
            <span className="text-xs font-extrabold text-amber-dark uppercase tracking-wider block">
              ⚡ Hackathon Judges 1-Click Test Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trigger Mismatch Button in Muted Terracotta #C85A32 */}
              <button
                type="button"
                onClick={() => handleSimulateAnswer(currentQ.sampleMismatch || "Only for 7 days until I feel better")}
                className="p-3 rounded-xl bg-white border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white font-bold text-sm text-left transition-colors shadow-xs flex items-center gap-2"
              >
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>Test Mismatch: "{currentQ.sampleMismatch || 'Only 7 days'}"</span>
              </button>

              {/* Trigger Aligned Button in Soft Eucalyptus #E3F1EC */}
              <button
                type="button"
                onClick={() => handleSimulateAnswer(currentQ.sampleCorrect || "Every morning for 30 days as prescribed")}
                className="p-3 rounded-xl bg-eucalyptus border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white font-bold text-sm text-left transition-colors shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <span>Test Aligned: "{currentQ.sampleCorrect || 'Full 30 days'}"</span>
              </button>
            </div>
          </div>

          {/* ── FEEDBACK CARDS (Aligned vs Mismatched) ────────────────────────── */}
          {feedback === 'aligned' && (
            <div className="p-6 rounded-2xl bg-eucalyptus border-2 border-eucalyptus-border text-charcoal space-y-4 animate-fade-in shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-teal text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CheckCircle2 size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-brand-teal">
                    {t(language, 'samjhaoWapas', 'alignedTitle')}
                  </h3>
                  <p className="text-lg text-charcoal font-medium leading-relaxed">
                    {feedbackMessage}
                  </p>
                  <p className="text-sm text-slate-warm font-semibold pt-1">
                    ✓ This instruction has been marked <strong>"Resolved"</strong> on your Care Plan.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleNext}
                  className="px-6 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-base shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{t(language, 'samjhaoWapas', 'nextQuestionBtn')}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {feedback === 'mismatch' && (
            <div className="p-6 rounded-2xl bg-terracotta-light border-2 border-terracotta text-charcoal space-y-4 animate-fade-in shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-terracotta text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertCircle size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-terracotta">
                    {t(language, 'samjhaoWapas', 'mismatchTitle')}
                  </h3>
                  <p className="text-lg text-charcoal font-medium leading-relaxed">
                    {feedbackMessage}
                  </p>
                  <p className="text-sm text-slate-warm">
                    No problem at all! We've made it easy for you to review the original instruction or send this directly to your Doctor Slip.
                  </p>
                </div>
              </div>

              {/* Action Buttons for Mismatch */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={handleListenCorrectInstruction}
                  className="px-5 py-3 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover font-bold text-sm flex items-center gap-2 shadow-xs"
                >
                  <Volume2 size={18} />
                  <span>{t(language, 'samjhaoWapas', 'listenCorrectBtn')}</span>
                </button>

                <button
                  onClick={handleAddQuestionToDoctorSlip}
                  disabled={addedToDoctor}
                  className={`px-5 py-3 rounded-xl font-bold text-sm border-2 transition-all flex items-center gap-2 ${
                    addedToDoctor
                      ? 'bg-eucalyptus text-brand-teal border-brand-teal'
                      : 'bg-white text-terracotta border-terracotta hover:bg-terracotta hover:text-white'
                  }`}
                >
                  <MessageSquarePlus size={18} />
                  <span>{addedToDoctor ? 'Added to Doctor Clarification Slip ✓' : t(language, 'samjhaoWapas', 'addToDoctorBtn')}</span>
                </button>

                <button
                  onClick={handleNext}
                  className="px-5 py-3 rounded-xl bg-white text-charcoal border border-slate-border hover:bg-slate-50 font-bold text-sm flex items-center gap-2 ml-auto"
                >
                  <span>{t(language, 'samjhaoWapas', 'nextQuestionBtn')}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
