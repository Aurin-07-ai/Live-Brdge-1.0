import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Clock,
  Info,
  MessageSquarePlus,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import ListenButton from './ListenButton';
import { useApp, Actions } from '../context/AppContext';
import { t } from '../data/translations';

export default function MedicineCard({ medicine, onAddQuestion, lang = 'en' }) {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const {
    id,
    name,
    dose,
    timing,
    instructions,
    source,
    isUnclear,
    warningTag,
    warningDetail,
    doctorClarified,
    category,
  } = medicine;

  const [expanded, setExpanded] = useState(false);
  const isSpeaking = state.speakingId === `med-${id}`;
  const isResolved = state.resolvedItems?.includes(id);

  // Check if this medicine is already in doctorQuestions
  const isAlreadyInDoctorSlip = state.doctorQuestions?.some(
    (q) => q.question?.toLowerCase().includes(name.toLowerCase()) || q.relatedInstruction?.toLowerCase().includes(name.toLowerCase())
  );

  const speakText = `${name}, ${dose}. Timing: ${timing}. Instructions: ${instructions}. Doctor notation: ${source}`;

  const handleAddQuestionToSlip = () => {
    if (isUnclear) {
      dispatch({
        type: Actions.ADD_DOCTOR_QUESTION,
        payload: {
          id: `dq-unclear-${id}`,
          question: `${name} (${dose}): Hospital slip has a smudged frequency. Should this be taken once at bedtime or twice daily?`,
          relatedInstruction: `${name} ${dose} · Frequency unreadable`,
          source: source || 'Discharge Summary Rx',
          category: 'unclear-smudged',
          isAmberWarning: true,
        },
      });
    } else {
      dispatch({
        type: Actions.ADD_DOCTOR_QUESTION,
        payload: {
          id: `dq-med-${id}-${Date.now()}`,
          question: `I would like to clarify the instructions for ${name} (${dose}) with my doctor.`,
          relatedInstruction: `${name} ${dose}: ${timing}`,
          source: source || 'Discharge Summary Rx',
          category: 'patient-clarification',
          isAmberWarning: false,
        },
      });
    }
  };

  return (
    <article
      className={`rounded-2xl p-6 transition-all duration-300 relative border-2 ${
        isSpeaking
          ? 'audio-highlight-active'
          : isUnclear
          ? 'bg-amber-light border-amber-warning shadow-card'
          : doctorClarified
          ? 'bg-ivory border-brand-teal/50 shadow-soft'
          : 'bg-ivory border-slate-border/80 shadow-soft hover:shadow-card hover:border-brand-teal/40'
      }`}
      aria-label={`Medicine: ${name}`}
    >
      {/* Top badges bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Unclear / Smudged warning badge */}
          {isUnclear && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-warning/20 text-amber-dark border border-amber-warning/40">
              <AlertTriangle size={14} className="text-amber-warning" />
              {warningTag || t(lang, 'carePlan', 'unclearWarningBadge')}
            </span>
          )}

          {/* Doctor Clarified Badge */}
          {doctorClarified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-eucalyptus text-eucalyptus-dark border border-brand-teal/30">
              <ShieldCheck size={14} className="text-brand-teal" />
              Clarified by Dr. Priya Sharma ✓
            </span>
          )}

          {/* Verified / Resolved badge */}
          {isResolved && !doctorClarified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-eucalyptus text-eucalyptus-dark border border-eucalyptus-border">
              <CheckCircle2 size={14} className="text-brand-teal" />
              {t(lang, 'carePlan', 'resolvedBadge')}
            </span>
          )}

          {category && (
            <span className="text-[11px] font-semibold text-slate-warm px-2 py-0.5 rounded bg-slate-subtle border border-slate-border">
              {category}
            </span>
          )}
        </div>

        {/* Source citation */}
        {source && (
          <span className="text-xs text-slate-warm font-medium">
            {source}
          </span>
        )}
      </div>

      {/* Main header row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Pill icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              isUnclear
                ? 'bg-amber-warning/15 text-amber-dark'
                : 'bg-brand-teal-soft text-brand-teal'
            }`}
          >
            <Pill size={28} className={isUnclear ? 'text-amber-dark' : 'text-brand-teal'} />
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-charcoal leading-tight">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-0.5 rounded-lg text-sm font-bold bg-slate-subtle/80 text-charcoal border border-slate-border">
                {dose}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-warm">
                <Clock size={16} className="text-brand-teal flex-shrink-0" />
                {timing}
              </span>
            </div>
          </div>
        </div>

        {/* Listen button */}
        <div className="self-start sm:self-auto">
          <ListenButton
            text={speakText}
            lang={lang}
            id={`med-${id}`}
            label={t(lang, 'carePlan', 'listenBtn')}
          />
        </div>
      </div>

      {/* Primary instructions card */}
      <div
        className={`mt-4 p-4 rounded-xl border ${
          isUnclear
            ? 'bg-amber-warning/10 border-amber-warning/30 text-charcoal'
            : doctorClarified
            ? 'bg-eucalyptus/60 border-brand-teal/30 text-charcoal'
            : 'bg-eucalyptus/40 border-eucalyptus-border text-charcoal'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <Info size={20} className={isUnclear ? 'text-amber-dark flex-shrink-0 mt-0.5' : 'text-brand-teal flex-shrink-0 mt-0.5'} />
          <p className="text-base md:text-lg leading-relaxed font-medium">
            {instructions}
          </p>
        </div>

        {/* Warning detail for smudged prescriptions */}
        {isUnclear && warningDetail && (
          <p className="mt-2 text-sm text-amber-dark font-medium pl-7">
            {warningDetail}
          </p>
        )}
      </div>

      {/* Expanded information */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-border/60 text-sm space-y-2">
          <div className="flex items-start gap-2 text-slate-warm">
            <span className="font-bold text-charcoal min-w-[120px]">
              {t(lang, 'carePlan', 'sourceLabel')}
            </span>
            <span>{source}</span>
          </div>
          <div className="flex items-start gap-2 text-slate-warm">
            <span className="font-bold text-charcoal min-w-[120px]">
              Patient Guidance:
            </span>
            <span>Take strictly according to schedule. Contact Dr. Priya Sharma if any dizziness or rash occurs.</span>
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-border/60">
        {/* Read More toggle */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:text-brand-teal-hover focus:outline-none focus:underline"
        >
          {expanded ? (
            <>
              {t(lang, 'carePlan', 'showLess')} <ChevronUp size={16} />
            </>
          ) : (
            <>
              {t(lang, 'carePlan', 'readMore')} <ChevronDown size={16} />
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Doctor Portal resolve button if smudged */}
          {isUnclear && (
            <button
              onClick={() => navigate('/doctor-panel')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-brand-teal text-white hover:bg-brand-teal-hover shadow-xs"
            >
              <Stethoscope size={14} />
              <span>Clarify in Doctor Panel</span>
            </button>
          )}

          {/* Ask Doctor / Add to Clarification Slip button */}
          <button
            onClick={handleAddQuestionToSlip}
            disabled={isAlreadyInDoctorSlip}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isAlreadyInDoctorSlip
                ? 'bg-eucalyptus text-brand-teal border border-eucalyptus-border cursor-default'
                : isUnclear
                ? 'bg-amber-warning text-white hover:bg-amber-dark shadow-sm'
                : 'bg-white text-brand-teal border border-brand-teal/30 hover:bg-brand-teal-soft'
            }`}
            aria-label={`Add question about ${name} to Doctor Clarification Slip`}
          >
            <MessageSquarePlus size={16} />
            <span>
              {isAlreadyInDoctorSlip
                ? t(lang, 'carePlan', 'addedToDoctorSlip')
                : isUnclear
                ? t(lang, 'carePlan', 'addToDoctorSlip')
                : t(lang, 'carePlan', 'addToDoctorSlip')}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
