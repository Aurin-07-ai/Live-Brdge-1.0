import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Calendar,
  Home,
  AlertTriangle,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Plus,
  MessageSquare,
  Heart,
  Activity,
  Clock,
  User,
  Sparkles,
  Volume2,
  FileText,
  Stethoscope,
  Columns,
  Maximize2,
} from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';
import { ListenButton } from '../components/ListenButton';
import MedicineCard from '../components/MedicineCard';
import MedicalReportsColumn from '../components/MedicalReportsColumn';
import { t } from '../data/translations';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function CarePlanPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const {
    carePlan,
    patient,
    language,
    demoMode,
    completedInstructions,
    doctorQuestions,
    speakingId,
    medicalReports,
    uploadNotice,
  } = state;

  // View state: split layout with Oriented Medical Reports Column
  const [showReportsColumn, setShowReportsColumn] = useState(true);

  // Collapsible section toggles
  const [checklistExpanded, setChecklistExpanded] = useState(true);
  const [medicinesExpanded, setMedicinesExpanded] = useState(true);
  const [followUpExpanded, setFollowUpExpanded] = useState(true);
  const [homecareExpanded, setHomecareExpanded] = useState(true);
  const [importantExpanded, setImportantExpanded] = useState(true);

  const handleToggleChecklist = (id) => {
    dispatch({ type: Actions.TOGGLE_INSTRUCTION_COMPLETE, payload: id });
  };

  const handleListenAllHomecare = () => {
    if (!carePlan?.homecare?.length) return;
    const fullText = carePlan.homecare.map((h) => h.instruction).join('. ');
    dispatch({ type: Actions.SET_SPEAKING_ID, payload: 'homecare-all' });
    import('../services/speechService').then(({ speechService }) => {
      speechService.speak(fullText, language, () => {
        dispatch({ type: Actions.SET_SPEAKING_ID, payload: null });
      });
    });
  };

  // ─── Empty State ────────────────────────────────────────────────────────────
  if (!carePlan) {
    return (
      <div className="bg-alabaster min-h-screen py-16 px-4">
        <div className="max-w-xl mx-auto bg-ivory rounded-3xl p-10 border-2 border-slate-border text-center shadow-card space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto">
            <Pill size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-charcoal">
            No Care Plan Loaded Yet
          </h1>
          <p className="text-lg text-slate-warm leading-relaxed">
            Upload your hospital discharge summary or explore the full interactive demo for Mrs. Shanti Verma.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => dispatch({ type: Actions.RESET_DEMO_DATA })}
              className="px-6 py-3.5 rounded-2xl bg-amber-warning hover:bg-amber-dark text-white font-extrabold text-lg shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              <span>Load Interactive Demo</span>
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3.5 rounded-2xl bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-lg shadow-card flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Checklist progress calculations
  const checklist = carePlan.todayChecklist || [];
  const completedCount = checklist.filter((item) =>
    completedInstructions.includes(item.id)
  ).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const followUp = carePlan.followUp || {};
  const followUpSpeech = `Your follow-up visit is with ${followUp.doctor || 'your doctor'} on ${formatDate(followUp.date)} at ${followUp.location}. Note: ${followUp.notes}`;
  const hasSmudge = (carePlan.medicines || []).some((m) => m.isUnclear);

  return (
    <div className="bg-alabaster min-h-screen pb-20">
      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="bg-brand-teal text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b-4 border-brand-teal-dark shadow-sm">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {demoMode && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 backdrop-blur-xs">
                <Sparkles size={14} />
                <span>Dynamic Care Engine · Live State & LocalStorage Persisted</span>
              </div>
            )}

            {/* PRIORITIZED DOCTOR PANEL LINK IN BANNER */}
            <button
              onClick={() => navigate('/doctor-panel')}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white text-brand-teal hover:bg-eucalyptus font-black text-xs sm:text-sm shadow-sm transition-all"
            >
              <Stethoscope size={16} />
              <span>Prioritize Doctor Panel →</span>
              {hasSmudge && (
                <span className="bg-amber-warning text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  Smudge Review Ready
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {t(language, 'carePlan', 'greeting')}
                {patient?.name ? `, ${patient.name}` : ''}!
              </h1>
              <p className="text-xl sm:text-2xl text-teal-100 font-medium mt-1">
                {t(language, 'carePlan', 'subGreeting')}
              </p>
            </div>

            {/* Action Buttons: Understanding Check & Layout Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Toggle Medical Reports Column */}
              <button
                onClick={() => setShowReportsColumn((prev) => !prev)}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/30 flex items-center gap-2 transition-colors"
                title="Toggle Oriented Medical Reports column view"
              >
                <Columns size={18} />
                <span>{showReportsColumn ? 'Hide Reports Column' : 'Show Reports Column'}</span>
              </button>

              {/* Samjhao Wapas Check button */}
              <button
                onClick={() => navigate('/understanding-check')}
                className="px-6 py-3.5 rounded-2xl bg-eucalyptus hover:bg-white text-brand-teal font-black text-base sm:text-lg shadow-card transition-all flex items-center gap-2.5 active:scale-[0.98] border border-eucalyptus-border"
              >
                <Activity size={22} className="text-brand-teal" />
                <span>{t(language, 'carePlan', 'checkUnderstandingBtn')}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Patient metadata tags in Warm Slate & Ivory */}
          <div className="pt-2 flex flex-wrap gap-2 text-sm">
            {patient?.hospital && (
              <span className="bg-black/20 text-white px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                <Heart size={14} /> {patient.hospital}
              </span>
            )}
            {patient?.dischargeDate && (
              <span className="bg-black/20 text-white px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                <Calendar size={14} /> Discharged: {patient.dischargeDate}
              </span>
            )}
            {patient?.doctor && (
              <span className="bg-black/20 text-white px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                <User size={14} /> {patient.doctor}
              </span>
            )}
            <span className="bg-black/20 text-teal-100 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
              <FileText size={14} /> {medicalReports?.length || 5} Oriented Reports Archived
            </span>
          </div>
        </div>
      </div>

      {uploadNotice && (
        <div className="bg-amber-light border-b-2 border-amber-warning/40 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-start gap-3 text-sm font-semibold text-amber-dark">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{uploadNotice}</p>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER WITH ORIENTED MEDICAL REPORTS COLUMN ─────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={`grid grid-cols-1 ${showReportsColumn ? 'lg:grid-cols-12 gap-8' : 'max-w-4xl mx-auto'} items-start`}>
          {/* ── LEFT COLUMN: ORIENTED MEDICAL REPORTS (When Active) ───────────── */}
          {showReportsColumn && (
            <div className="lg:col-span-5 order-2 lg:order-1 sticky top-28 space-y-4">
              <MedicalReportsColumn />
            </div>
          )}

          {/* ── RIGHT COLUMN: CORE CARE PLAN DASHBOARD ───────────────────────── */}
          <div className={`${showReportsColumn ? 'lg:col-span-7 order-1 lg:order-2' : 'w-full'} space-y-8`}>
            {/* ── SECTION 1: WHAT SHOULD I DO TODAY? ─────────────────────────── */}
            <section
              className={`bg-ivory rounded-3xl p-6 sm:p-8 border-2 border-slate-border/80 shadow-card transition-all ${
                speakingId === 'today-checklist' ? 'audio-highlight-active' : ''
              }`}
              aria-label="Today's Care Checklist"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-light flex items-center justify-center text-amber-dark">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                      ☀️ {t(language, 'carePlan', 'whatToDoToday')}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-warm font-medium">
                      {completedCount} of {totalCount} {t(language, 'carePlan', 'checklistProgress')} ({progressPercent}%)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setChecklistExpanded((v) => !v)}
                  className="p-2 text-slate-warm hover:text-charcoal focus:outline-none"
                  aria-label={checklistExpanded ? 'Collapse section' : 'Expand section'}
                >
                  {checklistExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {/* Accessible Progress Indicator */}
              <div className="w-full bg-slate-border/50 rounded-full h-4 overflow-hidden mb-6 p-0.5">
                <div
                  className="bg-brand-teal h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {checklistExpanded && (
                <div className="space-y-3">
                  {checklist.map((item) => {
                    const done = completedInstructions.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggleChecklist(item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left min-h-[64px] ${
                          done
                            ? 'border-eucalyptus-border bg-eucalyptus/50 text-charcoal'
                            : 'border-slate-border/80 bg-white hover:border-brand-teal/50 hover:bg-brand-teal-soft/20 text-charcoal'
                        }`}
                        aria-label={`Mark "${item.text}" as ${done ? 'incomplete' : 'completed'}`}
                      >
                        <div className="flex-shrink-0">
                          {done ? (
                            <CheckCircle size={32} className="text-brand-teal" strokeWidth={2.5} />
                          ) : (
                            <Circle size={32} className="text-slate-warm/60" strokeWidth={2} />
                          )}
                        </div>
                        <span className={`flex-1 text-lg font-bold ${done ? 'line-through text-slate-warm' : 'text-charcoal'}`}>
                          {item.text}
                        </span>
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white border border-slate-border text-slate-warm uppercase tracking-wider">
                          {item.time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── SECTION 2: MY MEDICINES ─────────────────────────────────────── */}
            <section className="space-y-4" aria-label="My Medicines Section">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                    <Pill size={26} />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                      {t(language, 'carePlan', 'medicinesTitle')} 💊
                    </h2>
                    <p className="text-xs text-slate-warm">
                      Extracted from oriented hospital records & verified by Dr. Priya Sharma
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMedicinesExpanded((v) => !v)}
                  className="p-2 text-slate-warm hover:text-charcoal"
                  aria-label={medicinesExpanded ? 'Collapse medicines' : 'Expand medicines'}
                >
                  {medicinesExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {medicinesExpanded && (
                <div className="space-y-6">
                  {(carePlan.medicines || []).map((med) => (
                    <MedicineCard
                      key={med.id}
                      medicine={med}
                      lang={language}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── SECTION 3: MY FOLLOW-UP VISIT ──────────────────────────────── */}
            <section
              className={`bg-ivory rounded-3xl p-6 sm:p-8 border-2 border-slate-border/80 shadow-card transition-all ${
                speakingId === 'follow-up-card' ? 'audio-highlight-active' : ''
              }`}
              aria-label="Follow-up Appointment"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-eucalyptus flex items-center justify-center text-brand-teal">
                    <Calendar size={26} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                    {t(language, 'carePlan', 'followUpTitle')} 📅
                  </h2>
                </div>

                <button
                  onClick={() => setFollowUpExpanded((v) => !v)}
                  className="p-2 text-slate-warm hover:text-charcoal"
                  aria-label={followUpExpanded ? 'Collapse follow-up' : 'Expand follow-up'}
                >
                  {followUpExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {followUpExpanded && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-alabaster border border-slate-border">
                      <span className="text-xs font-bold text-slate-warm uppercase tracking-wider block mb-1">
                        Doctor & Specialty
                      </span>
                      <p className="text-xl font-bold text-charcoal">{followUp.doctor || 'Dr. Priya Sharma'}</p>
                      <p className="text-sm text-slate-warm font-medium">{followUp.specialty || 'Internal Medicine'}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-alabaster border border-slate-border">
                      <span className="text-xs font-bold text-slate-warm uppercase tracking-wider block mb-1">
                        Appointment Date & Time
                      </span>
                      <p className="text-xl font-bold text-charcoal">{formatDate(followUp.date)}</p>
                      <p className="text-sm font-bold text-brand-teal">{followUp.time || '10:30 AM'}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-alabaster border border-slate-border space-y-2">
                    <span className="text-xs font-bold text-slate-warm uppercase tracking-wider block">
                      Location & Instructions
                    </span>
                    <p className="text-lg font-bold text-charcoal">{followUp.location}</p>
                    {followUp.notes && (
                      <p className="text-base text-slate-warm font-medium italic">
                        "{followUp.notes}"
                      </p>
                    )}
                    {followUp.source && (
                      <p className="text-xs text-slate-warm pt-1 border-t border-slate-border/50">
                        Source: {followUp.source}
                      </p>
                    )}
                  </div>

                  {/* Listen button for follow-up */}
                  <div className="flex items-center justify-between pt-2">
                    <ListenButton
                      text={followUpSpeech}
                      lang={language}
                      id="follow-up-card"
                      label="Listen to Follow-up Details"
                    />

                    <button
                      onClick={() => {
                        dispatch({
                          type: Actions.ADD_DOCTOR_QUESTION,
                          payload: {
                            id: `dq-followup-${Date.now()}`,
                            question: `Confirming follow-up appointment with Dr. Priya Sharma on ${formatDate(followUp.date)} at 10:30 AM.`,
                            relatedInstruction: 'Follow-up appointment',
                            source: followUp.source || 'Discharge Sheet',
                            category: 'appointment',
                          },
                        });
                        navigate('/doctor-questions');
                      }}
                      className="text-sm font-bold text-brand-teal hover:underline"
                    >
                      Add question about this visit →
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* ── SECTION 4: CARE AT HOME ────────────────────────────────────── */}
            <section
              className={`bg-ivory rounded-3xl p-6 sm:p-8 border-2 border-slate-border/80 shadow-card transition-all ${
                speakingId === 'homecare-all' ? 'audio-highlight-active' : ''
              }`}
              aria-label="Care at Home Instructions"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                    <Home size={26} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                    {t(language, 'carePlan', 'homecareTitle')} 🏠
                  </h2>
                </div>

                <button
                  onClick={() => setHomecareExpanded((v) => !v)}
                  className="p-2 text-slate-warm hover:text-charcoal"
                  aria-label={homecareExpanded ? 'Collapse care at home' : 'Expand care at home'}
                >
                  {homecareExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {homecareExpanded && (
                <div className="space-y-4">
                  {(carePlan.homecare || []).map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        speakingId === `hc-${item.id}`
                          ? 'audio-highlight-active'
                          : 'border-slate-border/80 bg-alabaster/60'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <p className="text-lg font-bold text-charcoal leading-relaxed">
                          {item.instruction}
                        </p>
                        {item.source && (
                          <span className="text-xs text-slate-warm font-medium">
                            {item.source}
                          </span>
                        )}
                      </div>

                      <ListenButton
                        text={item.instruction}
                        lang={language}
                        id={`hc-${item.id}`}
                        variant="small"
                      />
                    </div>
                  ))}

                  <div className="pt-2">
                    <button
                      onClick={handleListenAllHomecare}
                      className="w-full min-h-[50px] rounded-xl border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white font-extrabold text-base transition-colors flex items-center justify-center gap-2"
                    >
                      <Volume2 size={20} />
                      <span>{t(language, 'carePlan', 'listenAllHomecare')}</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* ── SECTION 5: IMPORTANT INSTRUCTIONS & WARNINGS ────────────────── */}
            <section className="bg-amber-light rounded-3xl p-6 sm:p-8 border-2 border-amber-warning shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-warning/20 flex items-center justify-center text-amber-dark">
                    <AlertTriangle size={28} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                    {t(language, 'carePlan', 'importantTitle')}
                  </h2>
                </div>

                <button
                  onClick={() => setImportantExpanded((v) => !v)}
                  className="p-2 text-slate-warm hover:text-charcoal"
                  aria-label={importantExpanded ? 'Collapse warnings' : 'Expand warnings'}
                >
                  {importantExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {importantExpanded && (
                <div className="space-y-3 pt-2">
                  {(carePlan.importantInstructions || []).map((instr) => (
                    <div
                      key={instr.id}
                      className={`p-4 rounded-2xl bg-white border border-amber-warning/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        speakingId === `warn-${instr.id}` ? 'audio-highlight-active' : ''
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <p className="text-lg font-bold text-charcoal leading-snug">
                          {instr.text}
                        </p>
                        {instr.source && (
                          <span className="text-xs text-slate-warm font-medium">
                            {instr.source}
                          </span>
                        )}
                      </div>

                      <ListenButton
                        text={instr.text}
                        lang={language}
                        id={`warn-${instr.id}`}
                        variant="small"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
