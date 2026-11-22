import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Stethoscope,
  Heart,
  Sparkles,
  Eye,
  Type,
  Globe,
  RotateCcw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';
import { t } from '../data/translations';

// ─── LiveBridge AI Logo ───────────────────────────────────────────────────────
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group" aria-label="LiveBridge AI Home">
      <div className="w-11 h-11 rounded-2xl bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20 shadow-sm group-hover:scale-105 transition-transform duration-200">
        <svg
          width="32"
          height="32"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Bridge arc in Calming Deep Teal #0F6E73 */}
          <path
            d="M5 28 C12 12, 28 12, 35 28"
            stroke="#0F6E73"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bridge vertical support pillars */}
          <line x1="12" y1="23" x2="12" y2="30" stroke="#0F6E73" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="23" x2="28" y2="30" stroke="#0F6E73" strokeWidth="2.5" strokeLinecap="round" />
          {/* Medical cross connection symbol */}
          <rect x="18" y="10" width="4" height="12" rx="2" fill="#0F6E73" />
          <rect x="14" y="14" width="12" height="4" rx="2" fill="#0F6E73" />
          {/* Soft base line */}
          <line x1="3" y1="31" x2="37" y2="31" stroke="#0F6E73" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="font-extrabold text-xl md:text-2xl text-charcoal tracking-tight group-hover:text-brand-teal transition-colors">
          LiveBridge <span className="text-brand-teal">AI</span>
        </span>
        <span className="text-[11px] font-semibold text-slate-warm tracking-wider uppercase hidden sm:block">
          Patient Understanding & Care Assistant
        </span>
      </div>
    </Link>
  );
}

// ─── Nav Link ─────────────────────────────────────────────────────────────────
function NavLink({ to, children, onClick, highlight = false }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-base font-bold px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
        active
          ? 'bg-brand-teal text-white shadow-sm'
          : highlight
          ? 'bg-eucalyptus text-brand-teal border border-brand-teal/30 hover:bg-brand-teal hover:text-white'
          : 'text-charcoal hover:bg-brand-teal-soft hover:text-brand-teal'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { state, dispatch } = useApp();
  const { language, textSize, simplifiedMode, portalMode, carePlan } = state;
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isDoctorPanel = pathname === '/doctor-panel';
  const pendingSmudge = (carePlan?.medicines || []).some((m) => m.isUnclear);

  const setLang = (lang) => dispatch({ type: Actions.SET_LANGUAGE, payload: lang });
  const setSize = (size) => dispatch({ type: Actions.SET_TEXT_SIZE, payload: size });
  const toggleSimplified = () =>
    dispatch({ type: Actions.SET_SIMPLIFIED_MODE, payload: !simplifiedMode });

  const handleResetDemo = () => {
    dispatch({ type: Actions.RESET_DEMO_DATA });
    navigate('/care-plan');
  };

  const navLinks = [
    { to: '/', label: t(language, 'nav', 'home') },
    { to: '/care-plan', label: t(language, 'nav', 'carePlan') },
    { to: '/understanding-check', label: t(language, 'nav', 'understandingCheck') },
    { to: '/doctor-questions', label: t(language, 'nav', 'doctorQuestions') },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-alabaster/95 backdrop-blur-md border-b border-slate-border/80 shadow-sm no-print">
      {/* Top Accessible Toolbar for Elderly & Healthcare Providers */}
      <div className="bg-eucalyptus/60 border-b border-eucalyptus-border/60 px-4 py-1.5 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Language Selector */}
          <div className="flex items-center gap-1 sm:gap-2" role="region" aria-label="Language selector">
            <Globe size={15} className="text-brand-teal flex-shrink-0" />
            <span className="font-semibold text-charcoal mr-1 hidden sm:inline">Language:</span>
            {languages.map((l, idx) => (
              <span key={l.code} className="inline-flex items-center">
                <button
                  onClick={() => setLang(l.code)}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                    language === l.code
                      ? 'bg-brand-teal text-white shadow-xs'
                      : 'text-charcoal hover:bg-brand-teal/15'
                  }`}
                  aria-pressed={language === l.code}
                >
                  {l.label}
                </button>
                {idx < languages.length - 1 && <span className="text-slate-warm mx-1">|</span>}
              </span>
            ))}
          </div>

          {/* Right: Quick Controls & Prioritized Doctor Portal Switcher */}
          <div className="flex items-center gap-3">
            {/* PRIORITIZED DOCTOR PORTAL BUTTON IN TOP BAR */}
            <Link
              to="/doctor-panel"
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg transition-all shadow-xs ${
                isDoctorPanel
                  ? 'bg-brand-teal text-white ring-2 ring-brand-teal-light'
                  : 'bg-white border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white'
              }`}
              title="Open Prioritized Doctor / Clinical Provider Panel"
            >
              <Stethoscope size={14} className={isDoctorPanel ? 'text-teal-200' : 'text-brand-teal'} />
              <span>🩺 Doctor Panel</span>
              {pendingSmudge && (
                <span className="w-2 h-2 rounded-full bg-amber-warning animate-ping" />
              )}
            </Link>

            {/* Text size selector */}
            <div className="flex items-center gap-1" role="group" aria-label="Text size selector">
              <Type size={14} className="text-brand-teal" />
              <button
                onClick={() => setSize('normal')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                  textSize === 'normal' ? 'bg-brand-teal text-white' : 'text-slate-warm hover:text-charcoal'
                }`}
                title="Normal text (18px)"
              >
                A
              </button>
              <button
                onClick={() => setSize('large')}
                className={`px-1.5 py-0.5 text-sm font-bold rounded ${
                  textSize === 'large' ? 'bg-brand-teal text-white' : 'text-slate-warm hover:text-charcoal'
                }`}
                title="Large text (21px)"
              >
                A+
              </button>
              <button
                onClick={() => setSize('xlarge')}
                className={`px-1.5 py-0.5 text-base font-bold rounded ${
                  textSize === 'xlarge' ? 'bg-brand-teal text-white' : 'text-slate-warm hover:text-charcoal'
                }`}
                title="Extra large text (24px)"
              >
                A++
              </button>
            </div>

            {/* Simplified Mode toggle */}
            <button
              onClick={toggleSimplified}
              className={`hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold rounded-lg border transition-colors ${
                simplifiedMode
                  ? 'bg-brand-teal text-white border-brand-teal'
                  : 'bg-white text-slate-warm border-slate-border hover:text-charcoal'
              }`}
              title="Toggle simplified mode for reduced clutter"
            >
              <Eye size={13} />
              <span>{simplifiedMode ? t(language, 'nav', 'simplifiedOn') : t(language, 'nav', 'simplifiedOff')}</span>
            </button>

            {/* Reset / Demo Data Fresh Loader */}
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-slate-warm hover:text-charcoal transition-colors"
              title="Reset state to fresh scenario"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2" aria-label="Main Navigation">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}

          {/* PRIORITIZED DOCTOR PANEL LINK */}
          <NavLink to="/doctor-panel" highlight={true}>
            <Stethoscope size={18} className="text-brand-teal" />
            <span>Doctor Panel</span>
            {pendingSmudge && (
              <span className="text-[10px] bg-amber-warning text-white px-1.5 py-0.2 rounded-full font-black">
                1 Flag
              </span>
            )}
          </NavLink>
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-xl font-bold text-base bg-brand-teal text-white hover:bg-brand-teal-hover shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
          >
            Upload Instructions
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="lg:hidden p-2.5 rounded-xl text-charcoal hover:bg-brand-teal-soft focus:outline-none focus:ring-2 focus:ring-brand-teal"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-ivory border-b border-slate-border px-4 py-4 space-y-3 animate-fade-in shadow-card">
          <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}>
                {label}
              </NavLink>
            ))}

            <NavLink to="/doctor-panel" highlight={true} onClick={() => setMobileOpen(false)}>
              <Stethoscope size={18} className="text-brand-teal" />
              <span>🩺 Doctor Panel (Priority)</span>
            </NavLink>
          </nav>

          <div className="pt-3 border-t border-slate-border flex flex-col gap-2">
            <Link
              to="/upload"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 px-4 rounded-xl font-bold text-center bg-brand-teal text-white"
            >
              Upload Instructions
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
