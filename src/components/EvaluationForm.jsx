import { useState } from 'react'
import ScorePanel from './ScorePanel'
import IssueTags from './IssueTags'
import ScoreComparison from './ScoreComparison'
import { saveEvaluation } from '../utils/storage'

const CRITERIA = [
  { key: 'instructionFollowing', label: 'Instruction Following' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'helpfulness', label: 'Helpfulness' },
  { key: 'tone', label: 'Tone' },
  { key: 'overall', label: 'Overall Quality' },
]

const defaultScores = () => Object.fromEntries(CRITERIA.map(c => [c.key, 0]))

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
      <section className="animate-fade-up" style={{ animationDelay: '0ms' }}>
        <Label>Prompt</Label>
        <textarea
          className="input-area h-24"
          placeholder="Paste the prompt / task given to the AI..."
          value={form.prompt}
          onChange={e => setField('prompt', e.target.value)}
        />
      </section>

      {/* Responses side by side */}
      <div className="animate-fade-up grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ animationDelay: '60ms' }}>
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
      <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">
          Scoring Rubric
        </h2>
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

      {/* Live score comparison + radar */}
      <ScoreComparison
        totalA={totalA}
        totalB={totalB}
        scoresA={form.scoresA}
        scoresB={form.scoresB}
      />

      {/* Winner */}
      <section className="animate-fade-up" style={{ animationDelay: '140ms' }}>
        <Label>Winner</Label>
        <div className="flex flex-wrap gap-3 mt-2">
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
      <section className="animate-fade-up" style={{ animationDelay: '160ms' }}>
        <Label>Issue Tags</Label>
        <IssueTags selected={form.tags} onChange={tags => setField('tags', tags)} />
      </section>

      {/* Reasoning */}
      <section className="animate-fade-up" style={{ animationDelay: '180ms' }}>
        <Label>Reasoning / Notes</Label>
        <textarea
          className="input-area h-28"
          placeholder="Explain your evaluation, what made one response better, key issues noticed..."
          value={form.reasoning}
          onChange={e => setField('reasoning', e.target.value)}
        />
      </section>

      {/* Actions */}
      <div className="animate-fade-up flex items-center gap-3 pt-2" style={{ animationDelay: '200ms' }}>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-violet-900/30"
        >
          Save Evaluation
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors border border-gray-700/50"
        >
          Reset
        </button>
        {saved && (
          <span className="text-emerald-400 text-sm font-medium animate-fade-in">
            ✓ Saved
          </span>
        )}
      </div>
    </div>
  )
}

function Label({ children }) {
  return (
    <label className="block text-sm font-medium text-gray-400 mb-1.5">
      {children}
    </label>
  )
}

function ResponseBlock({ label, value, onChange, color }) {
  const isBlue = color === 'blue'
  const border = isBlue ? 'border-blue-800/40' : 'border-emerald-800/40'
  const badge = isBlue
    ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50'
    : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50'
  const focusBorder = isBlue ? 'focus:border-blue-500/60' : 'focus:border-emerald-500/60'

  return (
    <div className={`rounded-xl border ${border} bg-gray-900/80 backdrop-blur-sm p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
          {label}
        </span>
      </div>
      <textarea
        className={`w-full h-44 bg-gray-950/60 border border-gray-800/60 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-current/20 transition-all ${focusBorder}`}
        placeholder={`Paste ${label} here...`}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function WinnerButton({ option, selected, onClick }) {
  const styles = {
    A: {
      active: 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40',
      idle: 'bg-gray-900/80 text-gray-400 border-gray-700/60 hover:border-blue-700/60 hover:text-blue-300',
      label: 'Response A Wins',
    },
    B: {
      active: 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40',
      idle: 'bg-gray-900/80 text-gray-400 border-gray-700/60 hover:border-emerald-700/60 hover:text-emerald-300',
      label: 'Response B Wins',
    },
    Tie: {
      active: 'bg-yellow-600 text-white border-yellow-500 shadow-lg shadow-yellow-900/40',
      idle: 'bg-gray-900/80 text-gray-400 border-gray-700/60 hover:border-yellow-700/60 hover:text-yellow-300',
      label: 'Tie',
    },
  }[option]

  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all ${selected ? styles.active : styles.idle}`}
    >
      {styles.label}
    </button>
  )
}
