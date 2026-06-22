import { useState } from 'react'
import { loadEvaluations, deleteEvaluation, exportToCSV } from '../utils/storage'
import RadarChart from './RadarChart'

const CRITERIA = [
  { key: 'instructionFollowing', label: 'Instr. Following' },
  { key: 'accuracy',             label: 'Accuracy'         },
  { key: 'clarity',              label: 'Clarity'          },
  { key: 'helpfulness',         label: 'Helpfulness'      },
  { key: 'tone',                 label: 'Tone'             },
  { key: 'overall',              label: 'Overall'          },
]

function totalScore(scores) {
  return CRITERIA.reduce((sum, c) => sum + (scores?.[c.key] || 0), 0)
}

export default function SavedEvaluations() {
  const [evaluations, setEvaluations] = useState(() => loadEvaluations())
  const [expanded, setExpanded] = useState(null)

  function handleDelete(id) {
    if (confirm('Delete this evaluation?')) {
      deleteEvaluation(id)
      setEvaluations(prev => prev.filter(e => e.id !== id))
      if (expanded === id) setExpanded(null)
    }
  }

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-24 text-gray-500 animate-fade-up">
        <div className="w-14 h-14 rounded-xl bg-gray-900/80 border border-gray-800/60 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <p className="text-base font-medium text-gray-400">No saved evaluations yet</p>
        <p className="text-sm mt-1 text-gray-600">Complete an evaluation and save it to see it here.</p>
      </div>
    )
  }

  // Aggregate stats
  const aWins = evaluations.filter(e => e.winner === 'A').length
  const bWins = evaluations.filter(e => e.winner === 'B').length
  const ties  = evaluations.filter(e => e.winner === 'Tie').length
  const avgA  = evaluations.reduce((sum, e) => sum + totalScore(e.scoresA), 0) / evaluations.length
  const avgB  = evaluations.reduce((sum, e) => sum + totalScore(e.scoresB), 0) / evaluations.length

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={evaluations.length} sub="evaluations" />
        <StatCard label="Avg Score A" value={avgA.toFixed(1)} sub="/ 30" color="violet" />
        <StatCard label="Avg Score B" value={avgB.toFixed(1)} sub="/ 30" color="amber" />
        <StatCard
          label="Win Rate A"
          value={evaluations.length ? `${Math.round((aWins / evaluations.length) * 100)}%` : '—'}
          sub={`${aWins}W · ${bWins}W · ${ties}T`}
          color="violet"
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300">
          {evaluations.length} Saved Evaluation{evaluations.length !== 1 ? 's' : ''}
        </h2>
        <button
          onClick={() => exportToCSV(evaluations)}
          className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-gray-700/50"
        >
          <span className="text-xs">⬇</span> Export CSV
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {evaluations.map(ev => (
          <EvalCard
            key={ev.id}
            ev={ev}
            isExpanded={expanded === ev.id}
            onToggle={() => setExpanded(expanded === ev.id ? null : ev.id)}
            onDelete={() => handleDelete(ev.id)}
          />
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  const textColor = {
    violet: 'text-violet-400',
    amber:  'text-amber-400',
    cyan:   'text-cyan-400',
  }[color] || 'text-white'

  return (
    <div className="bg-gray-900/80 border border-gray-800/60 rounded-xl p-4 backdrop-blur-sm">
      <p className={`text-2xl font-bold tabular-nums ${textColor}`}>{value}</p>
      <p className="text-xs font-medium text-gray-400 mt-0.5">{label}</p>
      <p className="text-xs text-gray-600">{sub}</p>
    </div>
  )
}

function EvalCard({ ev, isExpanded, onToggle, onDelete }) {
  const tA = totalScore(ev.scoresA)
  const tB = totalScore(ev.scoresB)

  const winnerStyle = {
    A:   { text: 'text-violet-400', bg: 'bg-violet-900/30 border-violet-800/50' },
    B:   { text: 'text-amber-400',  bg: 'bg-amber-900/30 border-amber-800/50'   },
    Tie: { text: 'text-yellow-400',  bg: 'bg-yellow-900/30 border-yellow-800/50'   },
  }[ev.winner] || { text: 'text-gray-500', bg: 'bg-gray-800/50 border-gray-700' }

  return (
    <div className="bg-gray-900/80 border border-gray-800/60 rounded-xl overflow-hidden backdrop-blur-sm hover:border-gray-700/60 transition-colors">
      {/* Header */}
      <div
        className="px-5 py-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {ev.prompt || <span className="text-gray-500 italic">No prompt</span>}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-gray-600">
                {new Date(ev.createdAt).toLocaleString()}
              </span>
              {ev.winner && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${winnerStyle.text} ${winnerStyle.bg}`}>
                  {ev.winner === 'Tie' ? 'Tie' : `Response ${ev.winner} wins`}
                </span>
              )}
              <span className="text-xs text-gray-500">
                A: <span className="text-violet-400 font-semibold tabular-nums">{tA}</span>
                <span className="text-gray-700">/30</span>
                {' · '}
                B: <span className="text-amber-400 font-semibold tabular-nums">{tB}</span>
                <span className="text-gray-700">/30</span>
              </span>
              {ev.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {ev.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-800/60 text-gray-500 px-2 py-0.5 rounded-full border border-gray-700/40">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="text-xs text-gray-700 hover:text-red-400 transition-colors px-2 py-1"
            >
              Delete
            </button>
            <span className="text-gray-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-800/60 px-5 py-5 space-y-5">
          <Field label="Prompt" value={ev.prompt} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field label="Response A" value={ev.responseA} />
            <Field label="Response B" value={ev.responseB} />
          </div>

          {/* Score breakdown + radar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ScoreBreakdown label="Response A" scores={ev.scoresA} total={tA} color="violet" />
            <ScoreBreakdown label="Response B" scores={ev.scoresB} total={tB} color="amber" />
            <div className="bg-gray-950/60 rounded-xl p-4 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-500 font-medium mb-2 self-start">Criteria Radar</p>
              <RadarChart scoresA={ev.scoresA} scoresB={ev.scoresB} />
            </div>
          </div>

          {ev.reasoning && <Field label="Reasoning / Notes" value={ev.reasoning} />}
        </div>
      )}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium mb-1.5">{label}</p>
      <p className="text-sm text-gray-300 bg-gray-950/60 border border-gray-800/40 rounded-lg px-3 py-2.5 whitespace-pre-wrap">
        {value || <span className="text-gray-600 italic">—</span>}
      </p>
    </div>
  )
}

function ScoreBreakdown({ label, scores, total, color }) {
  const isViolet = color === 'violet'
  const textColor = isViolet ? 'text-violet-400' : 'text-amber-400'
  const barGradient = isViolet ? 'from-violet-700 to-violet-400' : 'from-amber-700 to-amber-400'

  return (
    <div className="bg-gray-950/60 border border-gray-800/40 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-400">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${textColor}`}>{total}<span className="text-gray-600 font-normal text-xs">/30</span></span>
      </div>
      <div className="space-y-2.5">
        {CRITERIA.map(({ key, label: cLabel }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-24 shrink-0">{cLabel}</span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${barGradient} rounded-full transition-all`}
                style={{ width: `${((scores?.[key] || 0) / 5) * 100}%` }}
              />
            </div>
            <span className={`text-xs w-4 text-right tabular-nums ${scores?.[key] ? textColor : 'text-gray-600'}`}>
              {scores?.[key] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
