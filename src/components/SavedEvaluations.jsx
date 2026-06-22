import { useState } from 'react'
import { loadEvaluations, deleteEvaluation, exportToCSV } from '../utils/storage'
import RadarChart from './RadarChart'

const CRITERIA = [
  { key: 'instructionFollowing', label: 'Instr. Following' },
  { key: 'accuracy',             label: 'Accuracy'         },
  { key: 'clarity',              label: 'Clarity'          },
  { key: 'helpfulness',          label: 'Helpfulness'      },
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
      <div className="text-center py-24 animate-fade-up">
        <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span className="text-2xl">📋</span>
        </div>
        <p className="text-base font-medium text-slate-500">No saved evaluations yet</p>
        <p className="text-sm mt-1 text-slate-400">Complete an evaluation and save it to see it here.</p>
      </div>
    )
  }

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
          color="cyan"
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600">
          {evaluations.length} Saved Evaluation{evaluations.length !== 1 ? 's' : ''}
        </h2>
        <button
          onClick={() => exportToCSV(evaluations)}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-200 shadow-sm"
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
    violet: 'text-violet-600',
    amber:  'text-amber-600',
    cyan:   'text-cyan-600',
  }[color] || 'text-slate-800'

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className={`text-2xl font-bold tabular-nums ${textColor}`}>{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

function EvalCard({ ev, isExpanded, onToggle, onDelete }) {
  const tA = totalScore(ev.scoresA)
  const tB = totalScore(ev.scoresB)

  const winnerStyle = {
    A:   { text: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
    B:   { text: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200'  },
    Tie: { text: 'text-cyan-700',   bg: 'bg-cyan-50   border-cyan-200'   },
  }[ev.winner] || { text: 'text-slate-500', bg: 'bg-slate-100 border-slate-200' }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
      {/* Header */}
      <div
        className="px-5 py-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800 font-medium truncate">
              {ev.prompt || <span className="text-slate-400 italic">No prompt</span>}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-slate-400">
                {new Date(ev.createdAt).toLocaleString()}
              </span>
              {ev.winner && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${winnerStyle.text} ${winnerStyle.bg}`}>
                  {ev.winner === 'Tie' ? 'Tie' : `Response ${ev.winner} wins`}
                </span>
              )}
              <span className="text-xs text-slate-400">
                A: <span className="text-violet-600 font-semibold tabular-nums">{tA}</span>
                <span className="text-slate-300">/30</span>
                {' · '}
                B: <span className="text-amber-600 font-semibold tabular-nums">{tB}</span>
                <span className="text-slate-300">/30</span>
              </span>
              {ev.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {ev.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
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
              className="text-xs text-slate-300 hover:text-red-500 transition-colors px-2 py-1"
            >
              Delete
            </button>
            <span className="text-slate-300 text-xs">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-5 bg-slate-50/40">
          <Field label="Prompt" value={ev.prompt} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field label="Response A" value={ev.responseA} />
            <Field label="Response B" value={ev.responseB} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ScoreBreakdown label="Response A" scores={ev.scoresA} total={tA} color="violet" />
            <ScoreBreakdown label="Response B" scores={ev.scoresB} total={tB} color="amber" />
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
              <p className="text-xs text-slate-400 font-medium mb-2 self-start">Criteria Radar</p>
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
      <p className="text-xs text-slate-400 font-medium mb-1.5">{label}</p>
      <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 whitespace-pre-wrap shadow-sm">
        {value || <span className="text-slate-300 italic">—</span>}
      </p>
    </div>
  )
}

function ScoreBreakdown({ label, scores, total, color }) {
  const isViolet = color === 'violet'
  const textColor    = isViolet ? 'text-violet-600' : 'text-amber-600'
  const barGradient  = isViolet ? 'from-violet-500 to-violet-400' : 'from-amber-500 to-amber-400'
  const trackColor   = isViolet ? 'bg-violet-100' : 'bg-amber-100'

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${textColor}`}>{total}<span className="text-slate-300 font-normal text-xs">/30</span></span>
      </div>
      <div className="space-y-2.5">
        {CRITERIA.map(({ key, label: cLabel }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-24 shrink-0">{cLabel}</span>
            <div className={`flex-1 h-1.5 ${trackColor} rounded-full overflow-hidden`}>
              <div
                className={`h-full bg-gradient-to-r ${barGradient} rounded-full transition-all`}
                style={{ width: `${((scores?.[key] || 0) / 5) * 100}%` }}
              />
            </div>
            <span className={`text-xs w-4 text-right tabular-nums ${scores?.[key] ? textColor : 'text-slate-300'}`}>
              {scores?.[key] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
