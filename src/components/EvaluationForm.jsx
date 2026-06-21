import { useState } from 'react'
import ScorePanel from './ScorePanel'
import IssueTags from './IssueTags'
import { saveEvaluation } from '../utils/storage'

const CRITERIA = [
  { key: 'instructionFollowing', label: 'Instruction Following' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'helpfulness', label: 'Helpfulness' },
  { key: 'tone', label: 'Tone' },
  { key: 'overall', label: 'Overall Quality' },
]

const defaultScores = () =>
  Object.fromEntries(CRITERIA.map(c => [c.key, 0]))

const defaultForm = () => ({
  prompt: '',
  responseA: '',
  responseB: '',
  scoresA: defaultScores(),
  scoresB: defaultScores(),
  winner: '',
  reasoning: '',
  tags: [],
})

export default function EvaluationForm({ onSaved }) {
  const [form, setForm] = useState(defaultForm())
  const [saved, setSaved] = useState(false)

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function setScore(response, criterion, value) {
    const key = response === 'A' ? 'scoresA' : 'scoresB'
    setForm(f => ({ ...f, [key]: { ...f[key], [criterion]: value } }))
    setSaved(false)
  }

  function handleSave() {
    if (!form.prompt.trim() || !form.responseA.trim() || !form.responseB.trim()) {
      alert('Please fill in the prompt and both responses before saving.')
      return
    }
    saveEvaluation(form)
    setSaved(true)
    onSaved()
  }

  function handleReset() {
    if (confirm('Clear this evaluation and start over?')) {
      setForm(defaultForm())
      setSaved(false)
    }
  }

  const totalA = Object.values(form.scoresA).reduce((a, b) => a + b, 0)
  const totalB = Object.values(form.scoresB).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      {/* Prompt */}
      <section>
        <Label>Prompt</Label>
        <textarea
          className="input-area h-24"
          placeholder="Paste the prompt / task given to the AI..."
          value={form.prompt}
          onChange={e => setField('prompt', e.target.value)}
        />
      </section>

      {/* Responses side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponseBlock
          label="Response A"
          value={form.responseA}
          onChange={v => setField('responseA', v)}
          color="blue"
        />
        <ResponseBlock
          label="Response B"
          value={form.responseB}
          onChange={v => setField('responseB', v)}
          color="emerald"
        />
      </div>

      {/* Scoring */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Scoring Rubric</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScorePanel
            label="Response A"
            color="blue"
            criteria={CRITERIA}
            scores={form.scoresA}
            onScore={(criterion, value) => setScore('A', criterion, value)}
            total={totalA}
          />
          <ScorePanel
            label="Response B"
            color="emerald"
            criteria={CRITERIA}
            scores={form.scoresB}
            onScore={(criterion, value) => setScore('B', criterion, value)}
            total={totalB}
          />
        </div>
      </section>

      {/* Winner */}
      <section>
        <Label>Winner</Label>
        <div className="flex gap-3 mt-2">
          {['A', 'B', 'Tie'].map(option => (
            <WinnerButton
              key={option}
              option={option}
              selected={form.winner === option}
              onClick={() => setField('winner', option)}
            />
          ))}
        </div>
      </section>

      {/* Issue Tags */}
      <section>
        <Label>Issue Tags</Label>
        <IssueTags selected={form.tags} onChange={tags => setField('tags', tags)} />
      </section>

      {/* Reasoning */}
      <section>
        <Label>Reasoning / Notes</Label>
        <textarea
          className="input-area h-28"
          placeholder="Explain your evaluation, what made one response better, key issues noticed..."
          value={form.reasoning}
          onChange={e => setField('reasoning', e.target.value)}
        />
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
        >
          Save Evaluation
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
        >
          Reset
        </button>
        {saved && (
          <span className="text-emerald-400 text-sm font-medium">
            ✓ Saved successfully
          </span>
        )}
      </div>
    </div>
  )
}

function Label({ children }) {
  return (
    <label className="block text-sm font-medium text-gray-300 mb-1.5">
      {children}
    </label>
  )
}

function ResponseBlock({ label, value, onChange, color }) {
  const border = color === 'blue' ? 'border-blue-800/50' : 'border-emerald-800/50'
  const badge =
    color === 'blue'
      ? 'bg-blue-900/40 text-blue-300'
      : 'bg-emerald-900/40 text-emerald-300'

  return (
    <div className={`rounded-lg border ${border} bg-gray-900 p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badge}`}>
          {label}
        </span>
      </div>
      <textarea
        className="w-full h-40 bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500"
        placeholder={`Paste ${label} here...`}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function WinnerButton({ option, selected, onClick }) {
  const colors = {
    A: selected
      ? 'bg-blue-600 text-white border-blue-500'
      : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-blue-700',
    B: selected
      ? 'bg-emerald-600 text-white border-emerald-500'
      : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-emerald-700',
    Tie: selected
      ? 'bg-yellow-600 text-white border-yellow-500'
      : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-yellow-700',
  }

  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-lg border text-sm font-semibold transition-colors ${colors[option]}`}
    >
      {option === 'A' && '🅰 Response A Wins'}
      {option === 'B' && '🅱 Response B Wins'}
      {option === 'Tie' && '🤝 Tie'}
    </button>
  )
}
