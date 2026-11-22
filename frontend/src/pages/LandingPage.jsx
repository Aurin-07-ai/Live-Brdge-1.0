import { useNavigate } from 'react-router-dom';
import { Pill, Volume2, CheckCircle, ArrowRight, Sparkles, Upload, FileCheck2, MessageSquare, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';
import { t } from '../data/translations';

// ─── Elderly Patient Illustration (Friendly & Warm) ──────────────────────────
function ElderlyPatientHeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg
        viewBox="0 0 460 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
        aria-label="Illustration of an elderly grandmother comfortably viewing her care plan on a tablet"
      >
        {/* Soft Warm Background aura */}
        <circle cx="230" cy="200" r="175" fill="#E3F1EC" opacity="0.6" />
        <circle cx="230" cy="200" r="140" fill="#FAF8F5" opacity="0.8" />

        {/* Comfortable Armchair */}
        <rect x="120" y="220" width="220" height="25" rx="12" fill="#5A6577" opacity="0.25" />
        <rect x="135" y="240" width="20" height="75" rx="8" fill="#5A6577" opacity="0.4" />
        <rect x="305" y="240" width="20" height="75" rx="8" fill="#5A6577" opacity="0.4" />
        <rect x="125" y="150" width="210" height="85" rx="20" fill="#E2E8F0" />
        <rect x="105" y="170" width="25" height="100" rx="12" fill="#CBD5E1" />
        <rect x="330" y="170" width="25" height="100" rx="12" fill="#CBD5E1" />

        {/* Patient Figure (Sari/Cardigan in Calming Teal #0F6E73) */}
        <ellipse cx="230" cy="210" rx="55" ry="60" fill="#0F6E73" />
        {/* Shawl fold in Soft Eucalyptus #E3F1EC */}
        <path d="M190 195 Q230 235 270 195 L260 250 Q230 265 200 250 Z" fill="#E3F1EC" opacity="0.85" />

        {/* Hands gently holding tablet */}
        <path d="M175 220 Q155 245 165 265" stroke="#F6D5A8" strokeWidth="20" strokeLinecap="round" />
        <path d="M285 220 Q305 245 295 265" stroke="#F6D5A8" strokeWidth="20" strokeLinecap="round" />

        {/* Tablet device */}
        <rect x="180" y="235" width="100" height="75" rx="12" fill="#FFFFFF" stroke="#0F6E73" strokeWidth="3" />
        {/* Tablet screen with Care Plan UI preview */}
        <rect x="186" y="242" width="88" height="61" rx="8" fill="#FAF8F5" />
        {/* Medicine card preview on tablet */}
        <rect x="192" y="250" width="76" height="14" rx="4" fill="#0F6E73" opacity="0.85" />
        <circle cx="200" cy="257" r="3" fill="#FFFFFF" />
        <rect x="207" y="254" width="40" height="3" rx="1.5" fill="#FFFFFF" />
        <rect x="207" y="259" width="25" height="2.5" rx="1" fill="#E3F1EC" />

        <rect x="192" y="268" width="76" height="12" rx="4" fill="#E3F1EC" />
        <circle cx="200" cy="274" r="3" fill="#0F6E73" />
        <rect x="207" y="272" width="50" height="3" rx="1.5" fill="#1E293B" opacity="0.7" />

        <rect x="192" y="284" width="76" height="12" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="198" y="288" width="35" height="3" rx="1.5" fill="#5A6577" />

        {/* Patient Head & Warm Smile */}
        <ellipse cx="230" cy="145" rx="38" ry="42" fill="#F6D5A8" />
        {/* Silver / Grey hair bun */}
        <path d="M192 140 Q200 95 230 92 Q260 95 268 140 Q245 110 230 110 Q215 110 192 140 Z" fill="#94A3B8" />
        <circle cx="230" cy="85" r="14" fill="#94A3B8" />

        {/* Eyeglasses */}
        <circle cx="216" cy="142" r="11" fill="none" stroke="#5A6577" strokeWidth="2.5" />
        <circle cx="244" cy="142" r="11" fill="none" stroke="#5A6577" strokeWidth="2.5" />
        <line x1="227" y1="142" x2="233" y2="142" stroke="#5A6577" strokeWidth="2.5" />

        {/* Eyes behind glasses */}
        <ellipse cx="216" cy="142" rx="3" ry="3.5" fill="#1E293B" />
        <ellipse cx="244" cy="142" rx="3" ry="3.5" fill="#1E293B" />
        <circle cx="215" cy="141" r="1" fill="#FFFFFF" />
        <circle cx="243" cy="141" r="1" fill="#FFFFFF" />

        {/* Reassuring smile */}
        <path d="M220 162 Q230 172 240 162" stroke="#9F3E1D" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Floating Reassuring Badges */}
        {/* Audio badge */}
        <g transform="translate(60, 110)">
          <circle cx="25" cy="25" r="25" fill="#FFFFFF" filter="drop-shadow(0 4px 12px rgba(15,110,115,0.15))" />
          <path d="M16 25 L22 25 L28 19 L28 31 L22 25 L16 25 Z" fill="#0F6E73" />
          <path d="M31 20 Q35 25 31 30" stroke="#0F6E73" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M34 16 Q41 25 34 34" stroke="#0F6E73" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>

        {/* Medicine badge */}
        <g transform="translate(350, 95)">
          <circle cx="25" cy="25" r="25" fill="#FFFFFF" filter="drop-shadow(0 4px 12px rgba(15,110,115,0.15))" />
          <rect x="14" y="19" width="22" height="12" rx="6" fill="#0F6E73" />
          <line x1="25" y1="19" x2="25" y2="31" stroke="#FFFFFF" strokeWidth="2" />
        </g>

        {/* Verified tick badge */}
        <g transform="translate(360, 240)">
          <circle cx="24" cy="24" r="24" fill="#E3F1EC" filter="drop-shadow(0 4px 12px rgba(15,110,115,0.15))" />
          <path d="M15 24 L21 30 L33 18" stroke="#0F6E73" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { language } = state;

  const handleStartJourney = () => {
    navigate('/onboarding');
  };

  const handleQuickDemo = () => {
    dispatch({ type: Actions.ACTIVATE_DEMO });
    navigate('/care-plan');
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-alabaster min-h-screen">
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-14 md:pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Friendly pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eucalyptus text-brand-teal font-extrabold text-sm border border-eucalyptus-border shadow-xs">
              <HeartHandshake size={18} className="text-brand-teal" />
              <span>{t(language, 'landing', 'badge')}</span>
            </div>

            {/* Strict required headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal tracking-tight leading-[1.15]">
              {t(language, 'landing', 'headline')}
            </h1>

            {/* Strict required subheading */}
            <p className="text-xl sm:text-2xl text-slate-warm font-medium leading-relaxed max-w-2xl">
              {t(language, 'landing', 'subheading')}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Primary button in Calming Deep Teal #0F6E73 */}
              <button
                onClick={handleStartJourney}
                className="min-h-[58px] px-8 py-4 rounded-2xl bg-brand-teal hover:bg-brand-teal-hover active:scale-[0.98] text-white font-extrabold text-xl shadow-card transition-all flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-brand-teal/30"
              >
                <span>{t(language, 'landing', 'ctaPrimary')}</span>
                <ArrowRight size={22} />
              </button>

              {/* Secondary button */}
              <button
                onClick={handleScrollToHowItWorks}
                className="min-h-[58px] px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-charcoal font-bold text-lg border-2 border-slate-border shadow-xs transition-all flex items-center justify-center"
              >
                {t(language, 'landing', 'ctaSecondary')}
              </button>
            </div>

            {/* Hackathon Judge Fast Track Banner */}
            <div className="pt-4">
              <div className="p-4 rounded-2xl bg-amber-light border-2 border-amber-warning/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-warning/20 flex items-center justify-center flex-shrink-0 text-amber-dark">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-charcoal text-base">
                      Hackathon Judges Quick Tour (2–3 Mins)
                    </h2>
                    <p className="text-sm text-slate-warm font-medium">
                      Loads Mrs. Shanti Verma (68 yrs) with smudged prescription alert and 30-day duration check.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleQuickDemo}
                  className="px-5 py-2.5 rounded-xl bg-amber-warning text-white font-extrabold text-base hover:bg-amber-dark shadow-xs flex-shrink-0 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>{t(language, 'landing', 'tryDemo')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Hero Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <ElderlyPatientHeroIllustration />
          </div>
        </div>
      </section>

      {/* ── THREE FEATURE CARDS (Pure Ivory #FFFFFF) ───────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Understand My Medicines */}
          <div className="bg-ivory rounded-3xl p-8 border border-slate-border/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col items-start group">
            <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-6 group-hover:bg-brand-teal group-hover:text-white transition-colors duration-300">
              <Pill size={32} />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">
              {t(language, 'landing', 'feature1Title')}
            </h2>
            <p className="text-lg text-slate-warm leading-relaxed">
              {t(language, 'landing', 'feature1Desc')}
            </p>
          </div>

          {/* Card 2: Listen in My Language */}
          <div className="bg-ivory rounded-3xl p-8 border border-slate-border/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col items-start group">
            <div className="w-16 h-16 rounded-2xl bg-eucalyptus flex items-center justify-center text-brand-teal mb-6 group-hover:bg-brand-teal group-hover:text-white transition-colors duration-300">
              <Volume2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">
              {t(language, 'landing', 'feature2Title')}
            </h2>
            <p className="text-lg text-slate-warm leading-relaxed">
              {t(language, 'landing', 'feature2Desc')}
            </p>
          </div>

          {/* Card 3: Know What to Do Next */}
          <div className="bg-ivory rounded-3xl p-8 border border-slate-border/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col items-start group">
            <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-6 group-hover:bg-brand-teal group-hover:text-white transition-colors duration-300">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">
              {t(language, 'landing', 'feature3Title')}
            </h2>
            <p className="text-lg text-slate-warm leading-relaxed">
              {t(language, 'landing', 'feature3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* ── THREE SIMPLE STEPS EXPLANATION ─────────────────────────────────── */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto border-t border-slate-border/60">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal mb-4">
            {t(language, 'landing', 'howItWorksTitle')}
          </h2>
          <p className="text-xl text-slate-warm">
            {t(language, 'landing', 'howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-ivory rounded-3xl p-8 border-2 border-slate-border/80 shadow-soft relative flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-brand-teal text-white font-black text-xl flex items-center justify-center mb-6 shadow-sm">
              1
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">
              {t(language, 'landing', 'step1Title')}
            </h3>
            <p className="text-lg text-slate-warm leading-relaxed">
              {t(language, 'landing', 'step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-ivory rounded-3xl p-8 border-2 border-brand-teal/30 shadow-soft relative flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-brand-teal text-white font-black text-xl flex items-center justify-center mb-6 shadow-sm">
              2
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">
              {t(language, 'landing', 'step2Title')}
            </h3>
            <p className="text-lg text-slate-warm leading-relaxed">
              {t(language, 'landing', 'step2Desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-ivory rounded-3xl p-8 border-2 border-slate-border/80 shadow-soft relative flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-brand-teal text-white font-black text-xl flex items-center justify-center mb-6 shadow-sm">
              3
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">
              {t(language, 'landing', 'step3Title')}
            </h3>
            <p className="text-lg text-slate-warm leading-relaxed">
              {t(language, 'landing', 'step3Desc')}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={handleStartJourney}
            className="min-h-[58px] px-10 py-4 rounded-2xl bg-brand-teal hover:bg-brand-teal-hover active:scale-[0.98] text-white font-extrabold text-xl shadow-card transition-all inline-flex items-center gap-3"
          >
            <span>{t(language, 'landing', 'ctaPrimary')}</span>
            <ArrowRight size={22} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-border/80 py-10 px-4 text-center bg-white">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-extrabold text-charcoal text-lg">
            LiveBridge AI – Patient Understanding & Care Assistant
          </p>
          <p className="text-slate-warm text-sm">
            Designed for elderly patients, senior caregivers, and families. Empowering patient safety with high-contrast accessibility and clarity.
          </p>
          <p className="text-xs text-slate-warm pt-2">
            Hackathon Edition · High-Contrast Accessible Design (13:1 Ratio) · English, हिंदी, ਪੰਜਾਬੀ
          </p>
        </div>
      </footer>
    </div>
  );
}
