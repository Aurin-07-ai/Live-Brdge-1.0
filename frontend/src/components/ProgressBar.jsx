/**
 * ProgressBar
 *
 * Props:
 *  value     {number}  0–100  - current progress percentage
 *  label     {string}         - descriptive label shown above the bar
 *  showValue {boolean}        - whether to show the percentage number (default true)
 *  color     {string}         - Tailwind bg colour class (default 'bg-teal-500')
 *  height    {string}         - Tailwind height class (default 'h-3')
 *  className {string}         - extra classes on the wrapper
 */
export default function ProgressBar({
  value = 0,
  label = '',
  showValue = true,
  color = 'bg-teal-500',
  height = 'h-3',
  className = '',
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm font-medium text-slate-700">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-slate-600 ml-auto">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-slate-200 rounded-full overflow-hidden ${height}`}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`${color} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
