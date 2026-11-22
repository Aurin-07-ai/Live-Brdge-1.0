import { useState, useEffect, useCallback } from 'react';
import { Settings, X, Eye, Type, Volume2, Shield } from 'lucide-react';
import { useApp, Actions } from '../context/AppContext';

export default function AccessibilityBar() {
  const { state, dispatch } = useApp();
  const { textSize, simplifiedMode } = state;
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  // Alt+A keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const setSize = (size) => dispatch({ type: Actions.SET_TEXT_SIZE, payload: size });
  const toggleSimplified = () =>
    dispatch({ type: Actions.SET_SIMPLIFIED_MODE, payload: !simplifiedMode });

  const sizes = [
    { key: 'normal', label: 'Normal (18px)', sample: 'Aa' },
    { key: 'large', label: 'Large (21px)', sample: 'Aa+' },
    { key: 'xlarge', label: 'X-Large (24px)', sample: 'Aa++' },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50 no-print" role="region" aria-label="Accessibility options">
      {/* Floating Toggle button */}
      <button
        onClick={toggle}
        aria-label="Toggle accessibility controls (Alt+A)"
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-brand-teal text-white shadow-card hover:bg-brand-teal-hover active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-brand-teal/30"
      >
        {open ? <X size={26} /> : <Settings size={26} />}
      </button>

      {/* Pop-up Accessibility Panel */}
      {open && (
        <div
          className="absolute bottom-16 left-0 w-80 bg-ivory rounded-2xl shadow-card-hover border-2 border-brand-teal/20 p-5 space-y-5 animate-fade-in text-charcoal"
          role="dialog"
          aria-label="Accessibility settings"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-border pb-3">
            <h2 className="font-extrabold text-charcoal text-base flex items-center gap-2">
              <Settings size={18} className="text-brand-teal" />
              Accessibility & Comfort
            </h2>
            <span className="text-xs text-slate-warm font-semibold">Alt + A</span>
          </div>

          {/* Text Size Switcher */}
          <div>
            <p className="text-xs font-bold text-slate-warm uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Type size={14} className="text-brand-teal" />
              Text Size for Aging Eyes
            </p>
            <div className="grid grid-cols-1 gap-2" role="group" aria-label="Text size options">
              {sizes.map(({ key, label, sample }) => (
                <button
                  key={key}
                  onClick={() => setSize(key)}
                  aria-pressed={textSize === key}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                    textSize === key
                      ? 'border-brand-teal bg-eucalyptus text-brand-teal shadow-xs'
                      : 'border-slate-border bg-white text-charcoal hover:border-brand-teal/40'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-border">{sample}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Simplified Mode Toggle */}
          <div>
            <p className="text-xs font-bold text-slate-warm uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Eye size={14} className="text-brand-teal" />
              Simplified Interface
            </p>
            <button
              onClick={toggleSimplified}
              aria-pressed={simplifiedMode}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                simplifiedMode
                  ? 'border-brand-teal bg-brand-teal text-white'
                  : 'border-slate-border bg-white text-charcoal hover:border-slate-warm'
              }`}
            >
              <span>{simplifiedMode ? 'Simplified Mode: Enabled' : 'Simplified Mode: Disabled'}</span>
              <span className={`w-3.5 h-3.5 rounded-full ${simplifiedMode ? 'bg-white' : 'bg-slate-300'}`} />
            </button>
            <p className="text-xs text-slate-warm mt-1.5 leading-snug">
              Removes secondary icons and clutter for maximum reading ease.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-border text-center">
            <span className="text-xs text-slate-warm font-semibold">
              Designed for elderly patients & families
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
