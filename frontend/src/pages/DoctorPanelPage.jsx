import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  User,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Pill,
  Send,
  Plus,
  Edit2,
  Trash2,
  Printer,
  RotateCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Heart,
  Calendar,
  MessageSquare,
  Search,
  Check,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';
import MedicalReportsColumn from '../components/MedicalReportsColumn';

export default function DoctorPanelPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const {
    patient,
    patients,
    activePatientId,
    carePlan,
    doctorQuestions,
    comprehensionTelemetry,
    medicalReports,
  } = state;

  const [activeTab, setActiveTab] = useState('clarifications'); // 'clarifications' | 'medications' | 'reports' | 'telemetry'
  const [selectedQuestionId, setSelectedQuestionId] = useState(doctorQuestions[0]?.id || null);
  const [doctorReplyText, setDoctorReplyText] = useState('');
  const [doctorClinicalNotes, setDoctorClinicalNotes] = useState('');
  const [showAddMedModal, setShowAddMedModal] = useState(false);

  // Smudge clarification state
  const [smudgeTimingSelection, setSmudgeTimingSelection] = useState('Once daily at bedtime (8:00 PM)');
  const [smudgeDoseSelection, setSmudgeDoseSelection] = useState('20 mg');
  const [smudgeDoctorNote, setSmudgeDoctorNote] = useState(
    'Reviewed hospital inpatient chart: Indicated for hyperlipidemia (LDL 146 mg/dL). Prescribed 20mg OD at night. Take with water.'
  );

  // New medication form state
  const [newMedForm, setNewMedForm] = useState({
    name: '',
    dose: '',
    timing: 'Once daily morning',
    instructions: '',
    category: 'Cardiology / General',
  });

  const selectedQuestion = doctorQuestions.find((q) => q.id === selectedQuestionId) || doctorQuestions[0];
  const pendingSmudge = (carePlan?.medicines || []).find((m) => m.isUnclear);
  const clarifiedMeds = (carePlan?.medicines || []).filter((m) => m.doctorClarified);

  // Patient Switcher
  const handleSwitchPatient = (patientId) => {
    dispatch({ type: Actions.SWITCH_PATIENT, payload: patientId });
  };

  // 1-Click Smudge Clarification
  const handleClarifySmudge = () => {
    dispatch({
      type: Actions.CLARIFY_PRESCRIPTION_SMUDGE,
      payload: {
        medicineId: pendingSmudge?.id || 'm4',
        clarifiedTiming: smudgeTimingSelection,
        clarifiedDose: smudgeDoseSelection,
        doctorNotes: smudgeDoctorNote,
        physicianName: patient?.doctor || 'Dr. Priya Sharma',
      },
    });
  };

  // Answer patient question
  const handleSendAnswer = (questionId) => {
    if (!doctorReplyText.trim()) return;
    dispatch({
      type: Actions.ANSWER_DOCTOR_QUESTION,
      payload: {
        id: questionId,
        answerText: doctorReplyText.trim(),
        doctorNotes: doctorClinicalNotes.trim(),
      },
    });
    setDoctorReplyText('');
    setDoctorClinicalNotes('');
  };

  // Add Medication
  const handleAddMedicationSubmit = (e) => {
    e.preventDefault();
    if (!newMedForm.name.trim() || !newMedForm.dose.trim()) return;

    dispatch({
      type: Actions.ADD_MEDICATION,
      payload: {
        ...newMedForm,
        source: `Prescribed by ${patient?.doctor || 'Dr. Priya Sharma'} · ${new Date().toLocaleDateString()}`,
      },
    });

    setNewMedForm({
      name: '',
      dose: '',
      timing: 'Once daily morning',
      instructions: '',
      category: 'Cardiology / General',
    });
    setShowAddMedModal(false);
  };

  const handleDeleteMedication = (id) => {
    dispatch({ type: Actions.DELETE_MEDICATION, payload: id });
  };

  return (
    <div className="bg-alabaster min-h-screen pb-20">
      {/* ── DOCTOR PORTAL TOP BAR ─────────────────────────────────────────── */}
      <div className="bg-brand-teal text-white py-6 px-4 sm:px-6 lg:px-8 border-b-4 border-brand-teal-dark shadow-sm">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-xs border border-white/30">
                <Stethoscope size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                    Prioritized Clinical Provider Portal
                  </span>
                  <span className="text-xs text-teal-200">
                    Dr. Priya Sharma, MD (Internal Medicine)
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
                  Clinical Review & Prescription Clarification Panel
                </h1>
              </div>
            </div>

            {/* Switch to Patient View button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  dispatch({ type: Actions.SET_PORTAL_MODE, payload: 'patient' });
                  navigate('/care-plan');
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-brand-teal hover:bg-eucalyptus font-extrabold text-sm shadow-card transition-all flex items-center gap-2"
              >
                <span>Switch to Patient Care Plan View</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => window.print()}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                title="Print Clinical Summary"
              >
                <Printer size={18} />
              </button>
            </div>
          </div>

          {/* Patient Quick Selector & Clinical Status Cards */}
          <div className="pt-2 grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* 1. Patient Selector Dropdown */}
            <div className="bg-black/20 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block mb-1">
                Active Clinical Chart
              </span>
              <select
                value={activePatientId}
                onChange={(e) => handleSwitchPatient(e.target.value)}
                className="w-full bg-white text-charcoal font-bold text-sm p-2 rounded-xl border-none focus:ring-2 focus:ring-brand-teal"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age}F, UHID: {p.uhid})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Vitals & Admission */}
            <div className="bg-black/20 backdrop-blur-xs p-3 rounded-2xl border border-white/20 text-xs">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block mb-1">
                Latest Vitals & Room
              </span>
              <p className="font-bold text-white text-sm">
                BP: {patient?.vitals?.bp} · HR: {patient?.vitals?.pulse}
              </p>
              <p className="text-teal-200 truncate mt-0.5">
                SpO2: {patient?.vitals?.spO2} · {patient?.room}
              </p>
            </div>

            {/* 3. Comprehension Health Score */}
            <div className="bg-black/20 backdrop-blur-xs p-3 rounded-2xl border border-white/20 text-xs">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block mb-1">
                Comprehension Score
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">
                  {patient?.comprehensionScore || 82}%
                </span>
                <span className="text-[11px] bg-eucalyptus text-eucalyptus-dark font-extrabold px-2 py-0.5 rounded-full">
                  Good Retention
                </span>
              </div>
              <p className="text-teal-200 mt-0.5 truncate">
                Samjhao Wapas Telemetry: 1 Flagged, 2 Resolved
              </p>
            </div>

            {/* 4. Action Queue Badges */}
            <div className="bg-black/20 backdrop-blur-xs p-3 rounded-2xl border border-white/20 text-xs flex flex-col justify-center">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block mb-1">
                Review Queue
              </span>
              <div className="flex items-center gap-2">
                {pendingSmudge && (
                  <span className="bg-amber-warning text-white text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    ⚠️ 1 Smudge Pending
                  </span>
                )}
                <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {doctorQuestions.filter((q) => !q.answered).length} Question(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PORTAL NAVIGATION TABS ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-border pb-3">
          <button
            onClick={() => setActiveTab('clarifications')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm sm:text-base transition-all flex items-center gap-2 ${
              activeTab === 'clarifications'
                ? 'bg-brand-teal text-white shadow-card'
                : 'bg-ivory text-slate-warm hover:text-charcoal border border-slate-border'
            }`}
          >
            <AlertTriangle size={18} />
            <span>Clarifications & Questions</span>
            {pendingSmudge && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-warning ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('medications')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm sm:text-base transition-all flex items-center gap-2 ${
              activeTab === 'medications'
                ? 'bg-brand-teal text-white shadow-card'
                : 'bg-ivory text-slate-warm hover:text-charcoal border border-slate-border'
            }`}
          >
            <Pill size={18} />
            <span>Medication Management</span>
            <span className="text-xs bg-slate-subtle px-2 py-0.5 rounded-full">
              {carePlan?.medicines?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm sm:text-base transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-brand-teal text-white shadow-card'
                : 'bg-ivory text-slate-warm hover:text-charcoal border border-slate-border'
            }`}
          >
            <FileText size={18} />
            <span>Oriented Medical Records</span>
            <span className="text-xs bg-slate-subtle px-2 py-0.5 rounded-full">
              {medicalReports?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm sm:text-base transition-all flex items-center gap-2 ${
              activeTab === 'telemetry'
                ? 'bg-brand-teal text-white shadow-card'
                : 'bg-ivory text-slate-warm hover:text-charcoal border border-slate-border'
            }`}
          >
            <Activity size={18} />
            <span>Samjhao Wapas Telemetry</span>
            <span className="text-xs bg-eucalyptus text-eucalyptus-dark font-bold px-2 py-0.5 rounded-full">
              Live
            </span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: CLARIFICATIONS & PRESCRIPTION SMUDGE RESOLVER ───────────── */}
      {activeTab === 'clarifications' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          {/* 1. PRIORITY PRESCRIPTION SMUDGE RESOLVER CARD */}
          {pendingSmudge ? (
            <div className="bg-amber-light rounded-3xl p-6 sm:p-8 border-2 border-amber-warning shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-warning/20 text-amber-dark flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={30} />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-dark bg-white px-2.5 py-0.5 rounded-full border border-amber-warning/50">
                      Priority Action Required · Smudged Carbon Copy Line
                    </span>
                    <h2 className="text-2xl font-black text-charcoal mt-1">
                      Clarify Unreadable Prescription Line: {pendingSmudge.name}
                    </h2>
                    <p className="text-sm text-slate-warm mt-1">
                      The hospital discharge slip carbon has a water stain across the frequency column. Clarify the official dosage and timing for Mrs. Shanti Verma.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-warm">
                  Source: {pendingSmudge.source}
                </span>
              </div>

              {/* Doctor Clarifier Controls */}
              <div className="bg-white p-5 rounded-2xl border border-amber-warning/40 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                    Confirmed Timing:
                  </label>
                  <select
                    value={smudgeTimingSelection}
                    onChange={(e) => setSmudgeTimingSelection(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-border font-bold text-sm text-charcoal focus:border-brand-teal focus:outline-none bg-alabaster"
                  >
                    <option value="Once daily at bedtime (8:00 PM)">Once daily at bedtime (8:00 PM) - Recommended</option>
                    <option value="Twice daily after meals">Twice daily after meals (Morning & Evening)</option>
                    <option value="Once daily with morning breakfast">Once daily with morning breakfast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                    Confirmed Dosage:
                  </label>
                  <input
                    type="text"
                    value={smudgeDoseSelection}
                    onChange={(e) => setSmudgeDoseSelection(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-border font-bold text-sm text-charcoal focus:border-brand-teal focus:outline-none bg-alabaster"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                    Clinical Rationale & Notes:
                  </label>
                  <input
                    type="text"
                    value={smudgeDoctorNote}
                    onChange={(e) => setSmudgeDoctorNote(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-border text-xs text-charcoal focus:border-brand-teal focus:outline-none bg-alabaster"
                  />
                </div>
              </div>

              {/* Submit Clarification */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-slate-warm font-semibold">
                  Clicking "Sign & Push Clarification" will update the patient's Care Plan in real-time and clear the smudge alert.
                </span>

                <button
                  onClick={handleClarifySmudge}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-teal hover:bg-brand-teal-hover active:scale-[0.99] text-white font-black text-base shadow-card transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={20} />
                  <span>Sign & Push Clarification to Patient</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-eucalyptus rounded-3xl p-6 border-2 border-eucalyptus-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={28} className="text-brand-teal" />
                <div>
                  <h3 className="text-lg font-black text-brand-teal">
                    Prescription Smudge Clarified & Signed ✓
                  </h3>
                  <p className="text-xs text-charcoal font-medium">
                    Atorvastatin 20mg has been verified as Once Daily at Bedtime and updated in the patient's active Care Plan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/care-plan')}
                className="text-xs font-extrabold text-brand-teal hover:underline flex items-center gap-1"
              >
                Inspect on Care Plan <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* 2. DOCTOR QUESTIONS QUEUE (Split View) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Questions List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-charcoal">
                  Clarification Queue ({doctorQuestions.length})
                </h3>
                <span className="text-xs font-semibold text-slate-warm">
                  Tap to review & respond
                </span>
              </div>

              <div className="space-y-3">
                {doctorQuestions.map((q) => {
                  const isSelected = q.id === selectedQuestion?.id;
                  const isAnswered = q.answered;

                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuestionId(q.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-brand-teal bg-white shadow-card'
                          : 'border-slate-border/80 bg-ivory hover:border-brand-teal/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[11px] ${
                          isAnswered
                            ? 'bg-eucalyptus text-eucalyptus-dark'
                            : 'bg-amber-light text-amber-dark border border-amber-warning/30'
                        }`}>
                          {isAnswered ? 'Resolved ✓' : 'Pending Response'}
                        </span>
                        <span className="text-slate-warm text-[11px]">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <p className="font-extrabold text-sm text-charcoal leading-snug line-clamp-2">
                        {q.question}
                      </p>

                      <p className="text-xs text-slate-warm mt-1 truncate">
                        Ref: {q.relatedInstruction}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Question Response Workspace */}
            <div className="lg:col-span-7">
              {selectedQuestion ? (
                <div className="bg-ivory rounded-3xl p-6 sm:p-8 border-2 border-slate-border shadow-card space-y-6">
                  <div className="border-b border-slate-border pb-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-brand-teal uppercase tracking-wider">
                        Question Ref: {selectedQuestion.id}
                      </span>
                      {selectedQuestion.answered && (
                        <span className="text-xs bg-eucalyptus text-eucalyptus-dark px-2 py-0.5 rounded font-bold">
                          Answered by Dr. Priya Sharma
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-charcoal">
                      "{selectedQuestion.question}"
                    </h3>
                    <p className="text-xs text-slate-warm">
                      Source Context: {selectedQuestion.source} · Related: {selectedQuestion.relatedInstruction}
                    </p>
                  </div>

                  {/* Previous Answer if already answered */}
                  {selectedQuestion.doctorAnswer && (
                    <div className="p-4 rounded-2xl bg-eucalyptus/50 border border-eucalyptus-border space-y-1">
                      <span className="text-xs font-bold text-brand-teal block">
                        Current Physician Advice to Patient:
                      </span>
                      <p className="text-sm font-semibold text-charcoal">
                        {selectedQuestion.doctorAnswer}
                      </p>
                      {selectedQuestion.doctorNotes && (
                        <p className="text-xs text-slate-warm italic pt-1">
                          Chart Note: {selectedQuestion.doctorNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Response Input Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                        Physician Response to Patient (Simple, Reassuring Language):
                      </label>
                      <textarea
                        rows={3}
                        value={doctorReplyText}
                        onChange={(e) => setDoctorReplyText(e.target.value)}
                        placeholder="e.g., If your blood pressure reading exceeds 140/90, rest for 15 minutes and take another reading. Do not take an extra pill without calling my clinic."
                        className="w-full p-4 rounded-2xl border-2 border-slate-border focus:border-brand-teal focus:outline-none text-sm text-charcoal font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-warm uppercase tracking-wider mb-1">
                        Internal Clinical Chart Note (Visible on Clarification Slip):
                      </label>
                      <input
                        type="text"
                        value={doctorClinicalNotes}
                        onChange={(e) => setDoctorClinicalNotes(e.target.value)}
                        placeholder="e.g., Patient monitored for post-pneumonia recovery. Advised BP diary logging."
                        className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none text-xs text-charcoal"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleSendAnswer(selectedQuestion.id)}
                        disabled={!doctorReplyText.trim()}
                        className="px-6 py-3 rounded-xl bg-brand-teal hover:bg-brand-teal-hover active:scale-[0.99] text-white font-extrabold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send size={16} />
                        <span>Send Response to Patient's Care Plan</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-ivory rounded-3xl p-12 text-center text-slate-warm border-2 border-slate-border">
                  Select a question from the left queue to respond.
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ── TAB 2: DYNAMIC MEDICATION MANAGEMENT ───────────────────────────── */}
      {activeTab === 'medications' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-charcoal">
                Active Prescription & Regimen ({carePlan?.medicines?.length || 0})
              </h2>
              <p className="text-sm text-slate-warm">
                Add, modify doses, or adjust timings. Updates reflect dynamically in the patient's Care Plan.
              </p>
            </div>

            <button
              onClick={() => setShowAddMedModal(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover font-extrabold text-sm shadow-sm flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Add New Medication</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(carePlan?.medicines || []).map((med) => (
              <div
                key={med.id}
                className="bg-ivory p-6 rounded-3xl border-2 border-slate-border shadow-soft hover:shadow-card transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-teal-soft text-brand-teal flex items-center justify-center font-bold">
                      <Pill size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-charcoal">
                        {med.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold bg-slate-subtle px-2 py-0.5 rounded text-charcoal">
                          {med.dose}
                        </span>
                        <span className="text-xs font-semibold text-slate-warm">
                          {med.timing}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMedication(med.id)}
                    className="p-2 text-slate-warm hover:text-terracotta rounded-lg hover:bg-slate-100"
                    title="Discontinue / Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-sm text-charcoal bg-alabaster p-3 rounded-xl border border-slate-border font-medium">
                  {med.instructions}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-warm pt-1">
                  <span>Category: {med.category || 'Prescribed Drug'}</span>
                  {med.doctorClarified && (
                    <span className="text-eucalyptus-dark font-extrabold flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-brand-teal" /> Verified by Dr. Priya Sharma
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── TAB 3: ORIENTED MEDICAL RECORDS ─────────────────────────────────── */}
      {activeTab === 'reports' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <MedicalReportsColumn />
            </div>

            <div className="lg:col-span-7 bg-ivory rounded-3xl p-8 border-2 border-slate-border shadow-card space-y-6">
              <div className="border-b pb-4">
                <span className="text-xs font-extrabold text-brand-teal uppercase tracking-wider block">
                  Clinical Records Orientation & OCR Extraction
                </span>
                <h3 className="text-2xl font-black text-charcoal">
                  Hospital Records Repository for {patient?.name}
                </h3>
                <p className="text-sm text-slate-warm mt-1">
                  All clinical reports are chronologically aligned and can be rotated for visual clarity.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-eucalyptus/50 border border-eucalyptus-border text-sm text-charcoal space-y-1">
                  <h4 className="font-extrabold text-brand-teal">
                    Orientation & Rotation Support:
                  </h4>
                  <p>
                    Hospital fax transmissions and carbon copies often arrive rotated 90° or skewed. Doctors and patients can adjust orientation using the rotation controls, which save state across views.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-alabaster border border-slate-border text-sm space-y-2">
                  <h4 className="font-bold text-charcoal">
                    Diagnostic Reports Summary:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-warm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-teal" />
                      <span><strong>Discharge Summary (Nov 20):</strong> 4 medicines mapped, follow-up scheduled for Dec 5.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-teal" />
                      <span><strong>CBC Lab Panel (Nov 18):</strong> Normal WBC resolution (8,900 /mcL).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-teal" />
                      <span><strong>Lipid Profile (Nov 17):</strong> LDL 146 mg/dL indicative of Atorvastatin therapy.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-teal" />
                      <span><strong>Chest X-Ray PA View (Nov 19):</strong> Pneumonic consolidation substantially cleared.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── TAB 4: SAMJHAO WAPAS COMPREHENSION TELEMETRY ───────────────────── */}
      {activeTab === 'telemetry' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-charcoal">
              Patient Comprehension Telemetry (Samjhao Wapas Audit Log)
            </h2>
            <p className="text-sm text-slate-warm">
              Live audit trail showing patient understanding checks, spoken answers, and AI-assisted mismatch detections.
            </p>
          </div>

          <div className="space-y-4">
            {comprehensionTelemetry.map((item) => (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border-2 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.status === 'Mismatch Flagged'
                    ? 'bg-amber-light border-amber-warning/70'
                    : 'bg-ivory border-slate-border'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-warm">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      item.status === 'Mismatch Flagged'
                        ? 'bg-terracotta text-white'
                        : 'bg-eucalyptus text-brand-teal'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-xs font-bold text-charcoal">
                      {item.questionTitle}
                    </span>
                  </div>

                  <p className="text-base font-extrabold text-charcoal">
                    Patient Spoken/Typed: "{item.patientResponse}"
                  </p>

                  <p className="text-xs text-slate-warm">
                    Clinical Finding: {item.clinicalNote}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-brand-teal bg-white px-3 py-1.5 rounded-xl border border-slate-border">
                    {item.resolvedLater ? 'Resolved with AI Coaching ✓' : 'Needs Doctor Review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── ADD MEDICATION MODAL ──────────────────────────────────────────── */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ivory rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-slate-border shadow-card space-y-5 animate-fade-in text-charcoal">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-2xl font-black text-charcoal flex items-center gap-2">
                <Pill size={24} className="text-brand-teal" />
                Prescribe New Medication
              </h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="p-1.5 text-slate-warm hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicationSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-charcoal mb-1">
                  Drug Name (Generic / Brand)
                </label>
                <input
                  type="text"
                  required
                  value={newMedForm.name}
                  onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                  placeholder="e.g., Tab Calcium + Vitamin D3"
                  className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedForm.dose}
                    onChange={(e) => setNewMedForm({ ...newMedForm, dose: e.target.value })}
                    placeholder="e.g., 500 mg"
                    className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Timing
                  </label>
                  <select
                    value={newMedForm.timing}
                    onChange={(e) => setNewMedForm({ ...newMedForm, timing: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none bg-white"
                  >
                    <option value="Once daily in the morning">Once daily in the morning</option>
                    <option value="Twice daily with meals">Twice daily with meals</option>
                    <option value="Once daily at bedtime">Once daily at bedtime</option>
                    <option value="As needed for pain">As needed for pain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">
                  Patient Instructions (Plain Language)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newMedForm.instructions}
                  onChange={(e) => setNewMedForm({ ...newMedForm, instructions: e.target.value })}
                  placeholder="e.g., Take 1 tablet after lunch with water to strengthen bones."
                  className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-xl bg-brand-teal text-white font-extrabold hover:bg-brand-teal-hover shadow-sm"
                >
                  Prescribe & Add to Care Plan
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="py-3 px-5 rounded-xl bg-slate-100 text-charcoal font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
