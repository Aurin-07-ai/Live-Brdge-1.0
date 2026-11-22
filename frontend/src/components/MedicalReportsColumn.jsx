import { useState } from 'react';
import {
  FileText,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  User,
  Building2,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
  Eye,
  Trash2,
  Download,
  Sparkles,
} from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';
import { t } from '../data/translations';

export default function MedicalReportsColumn({ onSelectMedicine = null, activeMedicineId = null }) {
  const { state, dispatch } = useApp();
  const { medicalReports, activeReportId, language } = state;

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // New report form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Discharge Summary',
    doctor: 'Dr. Priya Sharma',
    hospital: 'Metro City Care Hospital',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    highlight1: '',
    highlight2: '',
  });

  const activeReport = medicalReports.find((r) => r.id === activeReportId) || medicalReports[0];

  const categories = ['All', 'Discharge Summary', 'Lab Report', 'Radiology & Imaging', 'Cardiology'];

  const filteredReports = categoryFilter === 'All'
    ? medicalReports
    : medicalReports.filter((r) => r.category === categoryFilter);

  const handleRotate = (id, delta) => {
    dispatch({
      type: Actions.UPDATE_REPORT_ROTATION,
      payload: { id, delta },
    });
  };

  const handleSelectReport = (id) => {
    dispatch({ type: Actions.SET_ACTIVE_REPORT, payload: id });
  };

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(180, Math.max(70, prev + delta)));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) return;

    dispatch({
      type: Actions.ADD_MEDICAL_REPORT,
      payload: {
        title: uploadForm.title.trim(),
        category: uploadForm.category,
        doctor: uploadForm.doctor.trim(),
        hospital: uploadForm.hospital.trim(),
        date: uploadForm.date,
        summary: uploadForm.summary.trim() || 'New medical report uploaded and processed.',
        highlights: [uploadForm.highlight1, uploadForm.highlight2].filter(Boolean),
        sourceFile: `${uploadForm.title.replace(/\s+/g, '_')}.pdf`,
      },
    });

    setUploadForm({
      title: '',
      category: 'Discharge Summary',
      doctor: 'Dr. Priya Sharma',
      hospital: 'Metro City Care Hospital',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      highlight1: '',
      highlight2: '',
    });
    setShowUploadModal(false);
  };

  return (
    <aside
      className="bg-ivory rounded-3xl p-5 sm:p-6 border-2 border-slate-border/80 shadow-card flex flex-col space-y-5"
      aria-label="Oriented Medical Reports Column"
    >
      {/* ── COLUMN HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-teal-soft flex items-center justify-center text-brand-teal">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-charcoal leading-tight">
              Medical Reports
            </h2>
            <p className="text-xs text-slate-warm font-semibold">
              Oriented & Chronological Archive
            </p>
          </div>
        </div>

        {/* Upload New Report Button */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-hover shadow-xs transition-colors"
          title="Upload new hospital report or lab slip"
        >
          <Plus size={15} />
          <span>Add Report</span>
        </button>
      </div>

      {/* ── ORIENTATION CONTROLS (ROTATE & ZOOM) ───────────────────────────── */}
      {activeReport && (
        <div className="p-3.5 rounded-2xl bg-alabaster border border-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-warm uppercase tracking-wider">
              Document Orientation:
            </span>
            <span className="text-xs font-extrabold text-brand-teal bg-white px-2 py-0.5 rounded border border-slate-border">
              {activeReport.rotation || 0}° Rotated
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            {/* Rotate Left */}
            <button
              onClick={() => handleRotate(activeReport.id, -90)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-border text-charcoal hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              title="Rotate document 90° counter-clockwise"
            >
              <RotateCcw size={14} className="text-brand-teal" />
              <span>Rotate 90° L</span>
            </button>

            {/* Rotate Right */}
            <button
              onClick={() => handleRotate(activeReport.id, 90)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-border text-charcoal hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              title="Rotate document 90° clockwise"
            >
              <RotateCw size={14} className="text-brand-teal" />
              <span>Rotate 90° R</span>
            </button>

            {/* Zoom In/Out */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleZoom(-15)}
                className="p-1.5 rounded-lg bg-white border border-slate-border hover:bg-slate-50 text-charcoal"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={() => handleZoom(15)}
                className="p-1.5 rounded-lg bg-white border border-slate-border hover:bg-slate-50 text-charcoal"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY FILTER TABS ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              categoryFilter === cat
                ? 'bg-brand-teal text-white shadow-xs'
                : 'bg-alabaster text-slate-warm hover:text-charcoal border border-slate-border/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── REPORTS LIST (CHRONOLOGICAL ORIENTATION) ───────────────────────── */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {filteredReports.map((report) => {
          const isSelected = report.id === activeReport?.id;
          const hasSmudge = report.status?.includes('Smudge');

          return (
            <div
              key={report.id}
              onClick={() => handleSelectReport(report.id)}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left relative ${
                isSelected
                  ? 'border-brand-teal bg-eucalyptus/40 shadow-xs'
                  : 'border-slate-border/70 bg-white hover:border-brand-teal/40 hover:bg-slate-50'
              }`}
            >
              {/* Category pill & date */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-warm mb-1.5">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-border text-brand-teal">
                  {report.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {report.date}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-extrabold text-sm sm:text-base text-charcoal leading-snug">
                {report.title}
              </h3>

              {/* Doctor / Facility */}
              <p className="text-xs text-slate-warm font-medium mt-1 truncate">
                {report.doctor} · {report.hospital}
              </p>

              {/* Status Badge */}
              <div className="mt-2.5 pt-2 border-t border-slate-border/50 flex items-center justify-between text-xs">
                {hasSmudge ? (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-dark text-[11px]">
                    <AlertTriangle size={12} className="text-amber-warning" />
                    1 Smudge Alert Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-eucalyptus-dark text-[11px]">
                    <CheckCircle2 size={12} className="text-brand-teal" />
                    Oriented & Verified
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectReport(report.id);
                    setPreviewModalOpen(true);
                  }}
                  className="text-brand-teal font-extrabold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Eye size={12} /> View Slip
                </button>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="p-8 text-center text-slate-warm text-sm">
            No reports found in this category.
          </div>
        )}
      </div>

      {/* ── ACTIVE REPORT MINI-PREVIEW CARD ────────────────────────────────── */}
      {activeReport && (
        <div className="p-4 rounded-2xl bg-alabaster border border-slate-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
              <FileText size={14} className="text-brand-teal" />
              Extracted Key Findings
            </span>
            <button
              onClick={() => setPreviewModalOpen(true)}
              className="text-xs font-extrabold text-brand-teal hover:underline flex items-center gap-1"
            >
              <Maximize2 size={13} /> Full Viewer
            </button>
          </div>

          <div className="space-y-1.5">
            {activeReport.highlights?.slice(0, 3).map((hl, i) => (
              <div key={i} className="text-xs text-charcoal bg-white p-2 rounded-xl border border-slate-border flex items-start gap-2">
                <span className="text-brand-teal font-bold">•</span>
                <span className="font-medium leading-relaxed">{hl}</span>
              </div>
            ))}
          </div>

          {activeReport.extractedMedicines?.length > 0 && (
            <div className="text-[11px] text-slate-warm pt-1">
              Linked to Care Plan: {activeReport.extractedMedicines.length} Prescription Item(s)
            </div>
          )}
        </div>
      )}

      {/* ── PREVIEW & ORIENTATION MODAL ────────────────────────────────────── */}
      {previewModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ivory rounded-3xl p-6 sm:p-8 max-w-2xl w-full border-2 border-slate-border shadow-card max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in text-charcoal">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-border pb-4">
              <div>
                <span className="text-xs font-bold text-brand-teal uppercase tracking-wider block">
                  {activeReport.category} · {activeReport.hospital}
                </span>
                <h3 className="text-2xl font-black text-charcoal">
                  {activeReport.title}
                </h3>
                <p className="text-xs text-slate-warm mt-0.5">
                  Report Date: {activeReport.date} · Attending: {activeReport.doctor}
                </p>
              </div>

              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-2 text-slate-warm hover:text-charcoal rounded-xl hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            {/* Visual Orientation Controls inside modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-alabaster rounded-2xl border border-slate-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRotate(activeReport.id, -90)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-border text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw size={14} className="text-brand-teal" /> Rotate -90°
                </button>
                <button
                  onClick={() => handleRotate(activeReport.id, 90)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-border text-xs font-bold flex items-center gap-1"
                >
                  <RotateCw size={14} className="text-brand-teal" /> Rotate +90°
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-warm">
                <span>Zoom: {zoomLevel}%</span>
                <button onClick={() => handleZoom(-15)} className="px-2 py-1 bg-white border rounded">
                  -
                </button>
                <button onClick={() => handleZoom(15)} className="px-2 py-1 bg-white border rounded">
                  +
                </button>
              </div>
            </div>

            {/* Document Visual Render Box (Simulated Paper / Scan with CSS Transform Rotation) */}
            <div className="bg-slate-100 p-6 rounded-2xl flex items-center justify-center overflow-hidden min-h-[320px] border border-slate-300">
              <div
                className="bg-white p-8 rounded-xl shadow-md border-2 border-slate-200 transition-all duration-300 w-full max-w-md space-y-4"
                style={{
                  transform: `rotate(${activeReport.rotation || 0}deg) scale(${zoomLevel / 100})`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Simulated Hospital Letterhead */}
                <div className="text-center border-b-2 border-brand-teal pb-3">
                  <h4 className="font-black text-sm uppercase text-brand-teal">
                    {activeReport.hospital}
                  </h4>
                  <p className="text-[10px] text-slate-warm">
                    Clinical Care & Diagnostics Center · Reg No: 2026/IND/4882
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1 text-[11px]">
                    <span><strong>Patient:</strong> {state.patient?.name} (68F)</span>
                    <span><strong>Date:</strong> {activeReport.date}</span>
                  </div>

                  <p className="text-xs text-charcoal font-semibold">
                    <strong>Clinical Summary:</strong> {activeReport.summary}
                  </p>

                  <div className="p-2.5 rounded-lg bg-alabaster border border-slate-200 space-y-1">
                    <span className="font-bold text-[11px] text-brand-teal block">
                      Findings & Parameters:
                    </span>
                    {activeReport.highlights?.map((hl, idx) => (
                      <p key={idx} className="text-[11px] text-slate-warm flex items-start gap-1.5">
                        <span className="text-brand-teal font-bold">•</span>
                        <span>{hl}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t text-[10px] text-slate-warm flex justify-between">
                  <span>Certified Digital Hospital Copy</span>
                  <span>Sign: {activeReport.doctor}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-brand-teal text-white font-extrabold text-sm"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW REPORT MODAL ──────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ivory rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-slate-border shadow-card space-y-5 animate-fade-in text-charcoal">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-2xl font-black text-charcoal flex items-center gap-2">
                <FileText size={22} className="text-brand-teal" />
                Add & Orient Medical Report
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-slate-warm hover:text-charcoal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-charcoal mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g., Follow-up Pulmonary Function Test"
                  className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none bg-white"
                  >
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Radiology & Imaging">Radiology & Imaging</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Prescription Slip">Prescription Slip</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    value={uploadForm.date}
                    onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Doctor / Specialist
                  </label>
                  <input
                    type="text"
                    value={uploadForm.doctor}
                    onChange={(e) => setUploadForm({ ...uploadForm, doctor: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Hospital / Lab Facility
                  </label>
                  <input
                    type="text"
                    value={uploadForm.hospital}
                    onChange={(e) => setUploadForm({ ...uploadForm, hospital: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">
                  Key Extracted Finding / Note
                </label>
                <input
                  type="text"
                  value={uploadForm.highlight1}
                  onChange={(e) => setUploadForm({ ...uploadForm, highlight1: e.target.value })}
                  placeholder="e.g., Normal lung volume, SpO2 98%"
                  className="w-full p-3 rounded-xl border-2 border-slate-border focus:border-brand-teal focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-xl bg-brand-teal text-white font-extrabold hover:bg-brand-teal-hover shadow-sm"
                >
                  Save & Orient Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="py-3 px-5 rounded-xl bg-slate-100 text-charcoal font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
