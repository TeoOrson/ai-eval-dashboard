import RadarChart from './RadarChart'

const MAX = 30

export default function ScoreComparison({ totalA, totalB, scoresA, scoresB }) {
  const diff = totalA - totalB
  const hasScores = totalA > 0 || totalB > 0

  return (
    <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">Live Score Comparison</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Bars */}
        <div className="space-y-3">
          <ScoreBar label="Response A" color="blue" total={totalA} />
          <ScoreBar label="Response B" color="emerald" total={totalB} />

          <div className="pt-2 border-t border-gray-800">
            {!hasScores ? (
              <p className="text-xs text-gray-600">Score both responses above to see comparison.</p>
            ) : diff === 0 ? (
              <span className="text-xs font-medium text-yellow-400">Tied — no clear winner yet</span>
            ) : (
              <span className={`text-xs font-medium ${diff > 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
                Response {diff > 0 ? 'A' : 'B'} leading by{' '}
                <span className="font-bold">{Math.abs(diff)}</span> point{Math.abs(diff) !== 1 ? 's' : ''}
                {' — '}
                <span className="text-gray-500">suggested winner: Response {diff > 0 ? 'A' : 'B'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Radar chart */}
        <div className="flex justify-center">
          <div className="w-full max-w-[200px]">
            <RadarChart scoresA={scoresA} scoresB={scoresB} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreBar({ label, color, total }) {
  const pct = (total / MAX) * 100
  const styles = {
    blue: {
      text: 'text-blue-400',
      bar: 'bg-gradient-to-r from-blue-700 to-blue-400',
      bg: 'bg-blue-900/20 border-blue-800/40',
    },
    emerald: {
      text: 'text-emerald-400',
      bar: 'bg-gradient-to-r from-emerald-700 to-emerald-400',
      bg: 'bg-emerald-900/20 border-emerald-800/40',
    },
  }[color]

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-semibold w-24 shrink-0 ${styles.text}`}>{label}</span>
      <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${styles.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums w-12 text-right ${styles.text}`}>
        {total}<span className="text-gray-600 font-normal">/30</span>
      </span>
    </div>
  )
}
