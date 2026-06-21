import { useState } from 'react'
import { loadEvaluations, deleteEvaluation, exportToCSV } from '../utils/storage'

const CRITERIA = [
  { key: 'instructionFollowing', label: 'Instr. Following' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'helpfulness', label: 'Helpfulness' },
  { key: 'tone', label: 'Tone' },
  { key: 'overall', label: 'Overall' },
]

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

  function handleExport() {
    exportToCSV(evaluations)
  }

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-lg font-medium text-gray-400">No saved evaluations yet</p>
        <p className="text-sm mt-1">
          Complete an evaluation and click "Save Evaluation" to store it here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-white">
          {evaluations.length} Saved Evaluation{evaluations.length !== 1 ? 's' : ''}
        </h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>⬇</span> Export CSV
        </button>
      </div>

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

function EvalCard({ ev, isExpanded, onToggle, onDelete }) {
  const totalA = Object.values(ev.scoresA || {}).reduce((a, b) => a + b, 0)
  const totalB = Object.values(ev.scoresB || {}).reduce((a, b) => a + b, 0)

  const winnerColor = {
    A: 'text-blue-400',
    B: 'text-emerald-400',
    Tie: 'text-yellow-400',
  }[ev.winner] || 'text-gray-500'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Card Header */}
      <div
        className="px-5 py-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {ev.prompt || <span className="text-gray-500 italic">No prompt</span>}
            </p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-gray-500">
                {new Date(ev.createdAt).toLocaleString()}
              </span>
              {ev.winner && (
                <span className={`text-xs font-semibold ${winnerColor}`}>
                  Winner: {ev.winner === 'Tie' ? 'Tie' : `Response ${ev.winner}`}
                </span>
              )}
              <span className="text-xs text-gray-500">
                A: <span className="text-blue-400 font-medium">{totalA}/30</span>
                {' · '}
                B: <span className="text-emerald-400 font-medium">{totalB}/30</span>
              </span>
              {ev.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {ev.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={e => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
            >
              Delete
            </button>
            <span className="text-gray-600 text-sm">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="border-t border-gray-800 px-5 py-5 space-y-5">
          {/* Prompt */}
          <Field label="Prompt" value={ev.prompt} />

          {/* Responses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field label="Response A" value={ev.responseA} />
            <Field label="Response B" value={ev.responseB} />
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ScoreBreakdown label="Response A" scores={ev.scoresA} total={totalA} color="blue" />
            <ScoreBreakdown label="Response B" scores={ev.scoresB} total={totalB} color="emerald" />
          </div>

          {/* Reasoning */}
          {ev.reasoning && <Field label="Reasoning / Notes" value={ev.reasoning} />}
        </div>
      )}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-sm text-gray-300 bg-gray-950 rounded-md px-3 py-2.5 whitespace-pre-wrap">
        {value || <span className="text-gray-600 italic">—</span>}
      </p>
    </div>
  )
}

function ScoreBreakdown({ label, scores, total, color }) {
  const textColor = color === 'blue' ? 'text-blue-400' : 'text-emerald-400'
  const barColor = color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'

  return (
    <div className="bg-gray-950 rounded-md p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-400">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{total} / 30</span>
      </div>
      <div className="space-y-2">
        {CRITERIA.map(({ key, label: cLabel }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-28 shrink-0">{cLabel}</span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full">
              <div
                className={`h-full ${barColor} rounded-full`}
                style={{ width: `${((scores?.[key] || 0) / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-6 text-right">{scores?.[key] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
