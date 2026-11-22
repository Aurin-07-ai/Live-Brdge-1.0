import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, ArrowLeft, Type, Globe, User, Check, Sparkles } from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';
import { t } from '../data/translations';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { language, textSize } = state;

  const [name, setName] = useState(state.patient?.name || '');
  const [selectedLang, setSelectedLang] = useState(language);
  const [selectedSize, setSelectedSize] = useState(textSize);

  const handleLangChange = (code) => {
    setSelectedLang(code);
    dispatch({ type: Actions.SET_LANGUAGE, payload: code });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    dispatch({ type: Actions.SET_TEXT_SIZE, payload: size });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    // Save patient profile
    dispatch({
      type: Actions.SET_PATIENT,
      payload: {
        name: name.trim() || (selectedLang === 'hi' ? 'श्रीमती शांति वर्मा' : selectedLang === 'pa' ? 'ਸ੍ਰੀਮਤੀ ਸ਼ਾਂਤੀ ਵਰਮਾ' : 'Mrs. Shanti Verma'),
        age: 68,
        language: selectedLang,
        hospital: 'Metro City Care Hospital',
        dischargeDate: 'Nov 20, 2026',
        doctor: 'Dr. Priya Sharma',
      },
    });
    navigate('/upload');
  };

  const handleDemoQuickstart = () => {
    dispatch({ type: Actions.ACTIVATE_DEMO });
    navigate('/care-plan');
  };

  const languages = [
    { code: 'en', label: 'English', script: 'English' },
    { code: 'hi', label: 'हिंदी', script: 'Hindi' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', script: 'Punjabi' },
  ];

  const sizes = [
    { key: 'normal', label: t(selectedLang, 'onboarding', 'sizeNormal'), desc: 'Standard readable' },
    { key: 'large', label: t(selectedLang, 'onboarding', 'sizeLarge'), desc: 'Comfortable reading' },
    { key: 'xlarge', label: t(selectedLang, 'onboarding', 'sizeXLarge'), desc: 'Easiest on aging eyes' },
  ];

  return (
    <div className="bg-alabaster min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-slate-warm hover:text-charcoal font-bold text-base mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t(selectedLang, 'common', 'home')}</span>
        </button>

        {/* Main Card on Pure Ivory #FFFFFF */}
        <div className="bg-ivory rounded-3xl p-8 sm:p-10 border-2 border-slate-border/80 shadow-card space-y-8">
          {/* Header */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-eucalyptus flex items-center justify-center text-brand-teal shadow-xs mx-auto sm:mx-0">
              <Heart size={28} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
              {t(selectedLang, 'onboarding', 'title')}
            </h1>
            <p className="text-xl text-slate-warm leading-relaxed">
              {t(selectedLang, 'onboarding', 'subtitle')}
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-8">
            {/* 1. Language Selection */}
            <div className="space-y-4">
              <label className="block text-xl font-bold text-charcoal flex items-center gap-2">
                <Globe size={22} className="text-brand-teal" />
                <span>{t(selectedLang, 'onboarding', 'chooseLang')}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {languages.map(({ code, label, script }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleLangChange(code)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center min-h-[80px] ${
                      selectedLang === code
                        ? 'border-brand-teal bg-brand-teal text-white shadow-card font-extrabold scale-[1.02]'
                        : 'border-slate-border bg-white text-charcoal hover:border-brand-teal/40 font-bold'
                    }`}
                  >
                    <span className="text-2xl mb-1">{label}</span>
                    <span className={`text-xs ${selectedLang === code ? 'text-teal-100' : 'text-slate-warm'}`}>
                      {script}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Text Size Selection */}
            <div className="space-y-4">
              <label className="block text-xl font-bold text-charcoal flex items-center gap-2">
                <Type size={22} className="text-brand-teal" />
                <span>{t(selectedLang, 'onboarding', 'chooseTextSize')}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sizes.map(({ key, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSizeChange(key)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[88px] flex flex-col justify-between ${
                      selectedSize === key
                        ? 'border-brand-teal bg-eucalyptus text-charcoal shadow-sm ring-2 ring-brand-teal/20'
                        : 'border-slate-border bg-white text-charcoal hover:border-slate-warm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-lg text-charcoal">{label}</span>
                      {selectedSize === key && <Check size={18} className="text-brand-teal" />}
                    </div>
                    <span className="text-xs text-slate-warm font-medium">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Optional Patient Name */}
            <div className="space-y-3">
              <label htmlFor="patient-name" className="block text-lg font-bold text-charcoal flex items-center gap-2">
                <User size={20} className="text-brand-teal" />
                <span>{t(selectedLang, 'onboarding', 'patientNameLabel')}</span>
              </label>
              <input
                id="patient-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(selectedLang, 'onboarding', 'patientNamePlaceholder')}
                className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-slate-border bg-white text-charcoal placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/15 font-medium transition-all"
              />
            </div>

            {/* Primary Continue Button in Calming Deep Teal #0F6E73 */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                className="w-full min-h-[60px] px-8 py-4 rounded-2xl bg-brand-teal hover:bg-brand-teal-hover active:scale-[0.99] text-white font-extrabold text-xl shadow-card transition-all flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-brand-teal/30"
              >
                <span>{t(selectedLang, 'onboarding', 'continueButton')}</span>
                <ArrowRight size={22} />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleDemoQuickstart}
                  className="inline-flex items-center gap-2 text-base font-bold text-amber-dark hover:text-amber-warning transition-colors"
                >
                  <Sparkles size={16} />
                  <span>{t(selectedLang, 'onboarding', 'skipToDemo')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
