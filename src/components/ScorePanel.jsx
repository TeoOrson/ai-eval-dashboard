const MAX_PER_CRITERION = 5
const MAX_TOTAL = 30

export default function ScorePanel({ label, color, criteria, scores, onScore, total }) {
  const isBlue = color === 'blue'
  const borderColor = isBlue ? 'border-blue-800/40' : 'border-emerald-800/40'
  const badgeCls = isBlue
    ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50'
    : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50'
  const totalColor = isBlue ? 'text-blue-400' : 'text-emerald-400'
  const barGradient = isBlue
    ? 'bg-gradient-to-r from-blue-700 to-blue-400'
    : 'bg-gradient-to-r from-emerald-700 to-emerald-400'
  const pipActive = isBlue
    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
    : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110'

  const pct = Math.round((total / MAX_TOTAL) * 100)

  return (
    <div className={`rounded-xl border ${borderColor} bg-gray-900/80 backdrop-blur-sm p-5`}>
      <div className="flex items-center justify-between mb-5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeCls}`}>
          {label}
        </span>
        <span className={`text-lg font-bold tabular-nums ${totalColor}`}>
          {total}<span className="text-xs text-gray-600 font-normal">/{MAX_TOTAL}</span>
        </span>
      </div>

      <div className="space-y-4">
        {criteria.map(({ key, label: criterionLabel }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{criterionLabel}</span>
              <span className={`text-xs font-semibold tabular-nums ${scores[key] > 0 ? totalColor : 'text-gray-600'}`}>
                {scores[key]}/{MAX_PER_CRITERION}
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: MAX_PER_CRITERION }, (_, i) => i + 1).map(val => (
                <button
                  key={val}
                  onClick={() => onScore(key, val === scores[key] ? 0 : val)}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${
                    scores[key] >= val
                      ? pipActive
                      : 'bg-gray-800/80 text-gray-600 hover:bg-gray-700 hover:text-gray-400'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-5 pt-4 border-t border-gray-800/60">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Total score</span>
          <span className={pct >= 70 ? totalColor : 'text-gray-500'}>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barGradient}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
