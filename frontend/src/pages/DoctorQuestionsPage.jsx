import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  Heart,
  ArrowLeft,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';
import { apiService } from '../services/api';
import { t } from '../data/translations';

function todayFormatted() {
  return new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function DoctorQuestionsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { language, patient, carePlan, sessionId, apiSource } = state;
  const doctorQuestions = state.doctorQuestions || [];
  const canDownloadPdf = Boolean(sessionId && apiSource === 'backend');

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('patient-clarification');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    dispatch({
      type: Actions.ADD_DOCTOR_QUESTION,
      payload: {
        id: `manual-${Date.now()}`,
        question: newQuestionText.trim(),
        relatedInstruction: 'Patient question for clinic visit',
        source: 'Added by Patient / Family',
        category: newQuestionCategory,
        isAmberWarning: newQuestionCategory === 'unclear-smudged',
      },
    });

    setNewQuestionText('');
    setShowAddModal(false);
  };

  const handleStartEdit = (q) => {
    setEditingId(q.id);
    setEditText(q.question);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    dispatch({
      type: Actions.EDIT_DOCTOR_QUESTION,
      payload: { id, question: editText.trim() },
    });
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (id) => {
    dispatch({ type: Actions.REMOVE_DOCTOR_QUESTION, payload: id });
  };

  const handleToggleAnswered = (id) => {
    dispatch({ type: Actions.TOGGLE_QUESTION_ANSWERED, payload: id });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!canDownloadPdf) return;
    setIsDownloading(true);
    setDownloadError('');
    try {
      const blob = await apiService.downloadClarificationSlip({
        sessionId,
        questions: doctorQuestions.map((q) => q.question),
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'HealthBridge_Doctor_Clarification_Slip.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download failed:', err);
      setDownloadError(err.message || 'Could not download the PDF slip.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-alabaster min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top bar (Hidden when printing) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/care-plan')}
            className="inline-flex items-center gap-2 text-slate-warm hover:text-charcoal font-bold text-base transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Care Plan</span>
          </button>

          {/* Action Buttons: Add Question & Print */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-charcoal font-bold text-base border-2 border-slate-border shadow-xs flex items-center gap-2"
            >
              <Plus size={18} className="text-brand-teal" />
              <span>{t(language, 'doctorSlip', 'addBtn')}</span>
            </button>

            {/* Backend-generated PDF (available after a live document upload) */}
            {canDownloadPdf && (
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                title="Generate this slip as a PDF from the Flask backend"
                className="px-5 py-3 rounded-2xl bg-white hover:bg-eucalyptus text-brand-teal font-bold text-base border-2 border-brand-teal shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                <FileText size={18} />
                <span>{isDownloading ? 'Generating PDF…' : 'Download PDF'}</span>
              </button>
            )}

            {/* Print Button in Calming Deep Teal #0F6E73 */}
            <button
              onClick={handlePrint}
              className="px-7 py-3 rounded-2xl bg-brand-teal hover:bg-brand-teal-hover active:scale-[0.98] text-white font-extrabold text-lg shadow-card flex items-center gap-2.5 transition-all"
            >
              <Printer size={20} />
              <span>{t(language, 'doctorSlip', 'printBtn')}</span>
            </button>
          </div>
        </div>

        {downloadError && (
          <p className="text-sm font-semibold text-terracotta bg-terracotta-light/60 border border-terracotta/40 rounded-xl px-4 py-3">
            {downloadError}
          </p>
        )}

        {/* ── PRINTABLE DOCTOR CLARIFICATION SLIP (Pure Ivory #FFFFFF) ─────────── */}
        <div className="print-slip-container bg-ivory rounded-3xl p-6 sm:p-10 border-2 border-slate-border shadow-card space-y-8">
          {/* Clinic Header */}
          <div className="border-b-2 border-brand-teal/30 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold text-sm">
                  HB
                </span>
                <span className="text-xs font-bold text-brand-teal uppercase tracking-widest">
                  LiveBridge AI · Doctor Clarification Slip
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-charcoal">
                {t(language, 'doctorSlip', 'title')}
              </h1>
              <p className="text-slate-warm text-base font-medium">
                {t(language, 'doctorSlip', 'subtitle')}
              </p>
            </div>

            <div className="text-left sm:text-right text-sm text-slate-warm space-y-1 bg-alabaster sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <p className="font-bold text-charcoal">Generated on: {todayFormatted()}</p>
              <p>Doctor: {patient?.doctor || 'Dr. Priya Sharma'}</p>
              <p>Hospital: {patient?.hospital || 'Metro City Care Hospital'}</p>
            </div>
          </div>

          {/* Patient Card Block */}
          <div className="p-4 sm:p-6 rounded-2xl bg-alabaster border border-slate-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs font-bold text-slate-warm uppercase tracking-wider block">
                Patient Name
              </span>
              <p className="text-lg font-bold text-charcoal">
                {patient?.name || 'Mrs. Shanti Verma'}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-warm uppercase tracking-wider block">
                Age & Gender
              </span>
              <p className="text-lg font-bold text-charcoal">
                68 Yrs / Female
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-warm uppercase tracking-wider block">
                Discharge Date
              </span>
              <p className="text-lg font-bold text-charcoal">
                {patient?.dischargeDate || 'Nov 20, 2026'}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-warm uppercase tracking-wider block">
                Follow-up Date
              </span>
              <p className="text-lg font-bold text-brand-teal">
                Dec 5, 2026 (10:30 AM)
              </p>
            </div>
          </div>

          {/* Notice to Doctor & Nurse */}
          <div className="p-4 rounded-xl bg-eucalyptus/60 border border-eucalyptus-border text-sm text-charcoal flex items-center gap-3">
            <Heart size={20} className="text-brand-teal flex-shrink-0" />
            <p className="font-semibold">
              <strong>Dear Doctor:</strong> The patient has prepared these specific clarification questions after reviewing their discharge summary with LiveBridge AI. Please note your advice in the response columns.
            </p>
          </div>

          {/* Questions List */}
          <div className="space-y-5">
            {doctorQuestions.length === 0 ? (
              <div className="text-center py-12 text-slate-warm">
                <FileText size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-lg font-semibold">{t(language, 'doctorSlip', 'emptyMsg')}</p>
              </div>
            ) : (
              doctorQuestions.map((q, idx) => {
                const isAmber = q.isAmberWarning || q.category === 'unclear-smudged';
                const isEditing = editingId === q.id;

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl p-5 border-2 transition-all space-y-3 ${
                      isAmber
                        ? 'bg-amber-light border-amber-warning/70 shadow-sm'
                        : 'bg-white border-slate-border hover:border-brand-teal/40'
                    }`}
                  >
                    {/* Header line of question */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          Q{idx + 1}
                        </span>

                        {/* Warm Amber Badge for Smudged / Unclear Line */}
                        {isAmber ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-warning text-white uppercase tracking-wider">
                            <AlertTriangle size={13} />
                            ⚠️ Prescribed Line Smudged / Unclear
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-warm uppercase tracking-wider px-2 py-0.5 rounded bg-slate-subtle">
                            Patient Clarification
                          </span>
                        )}
                      </div>

                      {/* Doctor Notes Checkbox */}
                      <button
                        onClick={() => handleToggleAnswered(q.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-warm hover:text-charcoal focus:outline-none"
                      >
                        {q.answered ? (
                          <CheckSquare size={16} className="text-brand-teal" />
                        ) : (
                          <Square size={16} />
                        )}
                        <span>{q.answered ? 'Answered by Doctor ✓' : 'Mark as answered'}</span>
                      </button>
                    </div>

                    {/* Question Content / Edit mode */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-3 rounded-xl border-2 border-brand-teal text-base font-medium text-charcoal focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(q.id)}
                            className="px-4 py-1.5 rounded-lg bg-brand-teal text-white text-xs font-bold flex items-center gap-1"
                          >
                            <Save size={14} /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-1.5 rounded-lg bg-slate-200 text-charcoal text-xs font-bold flex items-center gap-1"
                          >
                            <X size={14} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-charcoal leading-snug">
                        {q.question}
                      </p>
                    )}

                    {/* Source citation in Warm Slate #5A6577 */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-warm pt-1 border-t border-slate-border/50 gap-2">
                      <div className="space-x-2">
                        <span>Related: <strong>{q.relatedInstruction}</strong></span>
                        <span>·</span>
                        <span>Source: {q.source}</span>
                      </div>

                      {/* Action buttons (Hidden during print) */}
                      <div className="no-print flex items-center gap-3">
                        <button
                          onClick={() => handleStartEdit(q)}
                          className="text-slate-warm hover:text-charcoal font-semibold flex items-center gap-1"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-terracotta hover:text-terracotta-dark font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Doctor's Handwritten Notes Box for Physical Print */}
                    <div className="pt-2">
                      <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-white/60 text-xs text-slate-warm min-h-[44px]">
                        <span className="font-bold text-slate-400 block mb-1">Doctor's Clarification / Notes:</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Doctor Signature Block for Physical Print */}
          <div className="pt-8 border-t-2 border-slate-border grid grid-cols-2 gap-8 text-sm text-charcoal">
            <div className="space-y-8">
              <p className="text-xs text-slate-warm">
                Patient / Caregiver Signature: _______________________
              </p>
            </div>
            <div className="space-y-8 text-right">
              <p className="text-xs text-slate-warm">
                Dr. Priya Sharma (Physician Signature & Stamp): _______________________
              </p>
            </div>
          </div>
        </div>

        {/* ── ADD QUESTION MODAL ────────────────────────────────────────────── */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-ivory rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-slate-border shadow-card space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-charcoal">
                  Add Question for Doctor
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-warm hover:text-charcoal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label htmlFor="custom-question" className="block text-sm font-bold text-charcoal mb-1">
                    What would you like to ask your doctor?
                  </label>
                  <textarea
                    id="custom-question"
                    rows={3}
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="e.g., Can I take my blood pressure tablet at night instead of morning?"
                    className="w-full p-4 rounded-xl border-2 border-slate-border text-base font-medium text-charcoal focus:outline-none focus:border-brand-teal"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="question-category" className="block text-sm font-bold text-charcoal mb-1">
                    Question Type
                  </label>
                  <select
                    id="question-category"
                    value={newQuestionCategory}
                    onChange={(e) => setNewQuestionCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-border text-base font-semibold text-charcoal bg-white"
                  >
                    <option value="patient-clarification">General Clarification</option>
                    <option value="unclear-smudged">Unclear or Smudged Instruction (Warm Amber Flag)</option>
                    <option value="medication-side-effect">Side Effect Concern</option>
                    <option value="diet-exercise">Diet or Physical Activity</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-base shadow-sm"
                  >
                    Add to Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-charcoal font-bold text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
