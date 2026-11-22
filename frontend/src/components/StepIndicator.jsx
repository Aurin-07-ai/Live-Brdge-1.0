import { Check } from 'lucide-react';

/**
 * StepIndicator — horizontal multi-step progress tracker.
 *
 * Props:
 *  steps       {string[]}  - Array of step label strings.
 *  currentStep {number}    - 0-based index of the active step.
 *  className   {string}    - Extra Tailwind classes on the wrapper.
 */
export default function StepIndicator({ steps = [], currentStep = 0, className = '' }) {
  return (
    <nav
      aria-label="Progress steps"
      className={`flex items-center w-full ${className}`}
    >
      {steps.map((label, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        const upcoming = index > currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex items-center flex-1 min-w-0">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              {/* Circle */}
              <div
                aria-current={active ? 'step' : undefined}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  done
                    ? 'bg-teal-500 border-teal-500 text-white'
                    : active
                    ? 'bg-white border-teal-500 text-teal-600 shadow-md shadow-teal-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {done ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium text-center max-w-[72px] leading-tight ${
                  done
                    ? 'text-teal-600'
                    : active
                    ? 'text-teal-700 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-18px] rounded-full transition-colors ${
                  done ? 'bg-teal-400' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
