import RadarChart from './RadarChart'

const MAX = 30

export default function ScoreComparison({ totalA, totalB, scoresA, scoresB }) {
  const diff = totalA - totalB
  const hasScores = totalA > 0 || totalB > 0

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Live Score Comparison</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <ScoreBar label="Response A" color="violet" total={totalA} />
          <ScoreBar label="Response B" color="amber"  total={totalB} />

          <div className="pt-2 border-t border-slate-100">
            {!hasScores ? (
              <p className="text-xs text-slate-400">Score both responses above to see comparison.</p>
            ) : diff === 0 ? (
              <span className="text-xs font-medium text-cyan-600">Tied — no clear winner yet</span>
            ) : (
              <span className={`text-xs font-medium ${diff > 0 ? 'text-violet-600' : 'text-amber-600'}`}>
                Response {diff > 0 ? 'A' : 'B'} leading by{' '}
                <span className="font-bold">{Math.abs(diff)}</span> point{Math.abs(diff) !== 1 ? 's' : ''}
                {' — '}
                <span className="text-slate-400">suggested winner: Response {diff > 0 ? 'A' : 'B'}</span>
              </span>
            )}
          </div>
        </div>

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
  const s = {
    violet: { text: 'text-violet-600', bar: 'bg-gradient-to-r from-violet-500 to-violet-400', track: 'bg-violet-100' },
    amber:  { text: 'text-amber-600',  bar: 'bg-gradient-to-r from-amber-500  to-amber-400',  track: 'bg-amber-100'  },
  }[color]

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-semibold w-24 shrink-0 ${s.text}`}>{label}</span>
      <div className={`flex-1 h-2.5 ${s.track} rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${s.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums w-12 text-right ${s.text}`}>
        {total}<span className="text-slate-300 font-normal">/30</span>
      </span>
    </div>
  )
}
