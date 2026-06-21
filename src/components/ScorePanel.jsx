const MAX_PER_CRITERION = 5
const MAX_TOTAL = 30

export default function ScorePanel({ label, color, criteria, scores, onScore, total }) {
  const borderColor = color === 'blue' ? 'border-blue-800/50' : 'border-emerald-800/50'
  const badgeColor =
    color === 'blue'
      ? 'bg-blue-900/40 text-blue-300'
      : 'bg-emerald-900/40 text-emerald-300'
  const fillColor = color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'

  return (
    <div className={`rounded-lg border ${borderColor} bg-gray-900 p-5`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeColor}`}>
          {label}
        </span>
        <span className="text-sm font-bold text-white">
          {total} / {MAX_TOTAL}
        </span>
      </div>

      <div className="space-y-4">
        {criteria.map(({ key, label: criterionLabel }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{criterionLabel}</span>
              <span className="text-xs font-medium text-gray-300">
                {scores[key]} / {MAX_PER_CRITERION}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_PER_CRITERION }, (_, i) => i + 1).map(val => (
                <button
                  key={val}
                  onClick={() => onScore(key, val === scores[key] ? 0 : val)}
                  className={`flex-1 h-7 rounded text-xs font-medium transition-colors ${
                    scores[key] >= val
                      ? `${fillColor} text-white`
                      : 'bg-gray-800 text-gray-600 hover:bg-gray-700'
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
      <div className="mt-5 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Total score</span>
          <span>{Math.round((total / MAX_TOTAL) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${fillColor} rounded-full transition-all`}
            style={{ width: `${(total / MAX_TOTAL) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
