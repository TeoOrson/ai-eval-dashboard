import { useState } from 'react'
import IssueTags from './IssueTags'
import ScoreComparison from './ScoreComparison'
import StepCard, { StepConnector } from './StepCard'
import { saveEvaluation } from '../utils/storage'

const CRITERIA = [
  { key: 'instructionFollowing', label: 'Instruction Following' },
  { key: 'accuracy',             label: 'Accuracy'              },
  { key: 'clarity',              label: 'Clarity'               },
  { key: 'helpfulness',          label: 'Helpfulness'           },
  { key: 'tone',                 label: 'Tone'                  },
  { key: 'overall',              label: 'Overall Quality'       },
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
  const [open, setOpen] = useState({ prompt: true, responses: true, scoring: true, verdict: true })

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function setScoreA(criterion, value) {
    setForm(f => ({ ...f, scoresA: { ...f.scoresA, [criterion]: value } }))
    setSaved(false)
  }

  function setScoreB(criterion, value) {
    setForm(f => ({ ...f, scoresB: { ...f.scoresB, [criterion]: value } }))
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

  const toggle = step => setOpen(o => ({ ...o, [step]: !o[step] }))

  const totalA = Object.values(form.scoresA).reduce((a, b) => a + b, 0)
  const totalB = Object.values(form.scoresB).reduce((a, b) => a + b, 0)

  // Step statuses
  const promptStatus   = form.prompt.trim() ? 'complete' : 'empty'
  const responsesStatus =
    form.responseA.trim() && form.responseB.trim() ? 'complete' :
    form.responseA.trim() || form.responseB.trim() ? 'active' : 'empty'
  const anyScored = CRITERIA.some(c => form.scoresA[c.key] > 0 || form.scoresB[c.key] > 0)
  const allScored = CRITERIA.every(c => form.scoresA[c.key] > 0 && form.scoresB[c.key] > 0)
  const scoringStatus = allScored ? 'complete' : anyScored ? 'active' : 'empty'
  const verdictStatus = saved ? 'complete' : form.winner ? 'active' : 'empty'

  return (
    <div className="space-y-0">
      {/* ── Step 1: Prompt ── */}
      <StepCard
        number={1} title="Prompt"
        status={promptStatus}
        isOpen={open.prompt}
        onToggle={() => toggle('prompt')}
      >
        <textarea
          className="input-area h-28"
          placeholder="Paste the prompt / task given to the AI..."
          value={form.prompt}
          onChange={e => setField('prompt', e.target.value)}
        />
      </StepCard>

      <StepConnector />

      {/* ── Step 2: Responses ── */}
      <StepCard
        number={2} title="Responses"
        status={responsesStatus}
        isOpen={open.responses}
        onToggle={() => toggle('responses')}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResponseBlock
            label="Response A" color="blue"
            value={form.responseA}
            onChange={v => setField('responseA', v)}
          />
          <ResponseBlock
            label="Response B" color="emerald"
            value={form.responseB}
            onChange={v => setField('responseB', v)}
          />
        </div>
      </StepCard>

      <StepConnector />

      {/* ── Step 3: Scoring ── */}
      <StepCard
        number={3} title="Scoring"
        status={scoringStatus}
        isOpen={open.scoring}
        onToggle={() => toggle('scoring')}
      >
        <div className="space-y-5">
          <CriteriaTable
            criteria={CRITERIA}
            scoresA={form.scoresA}
            scoresB={form.scoresB}
            onScoreA={setScoreA}
            onScoreB={setScoreB}
            totalA={totalA}
            totalB={totalB}
          />
          <ScoreComparison
            totalA={totalA} totalB={totalB}
            scoresA={form.scoresA} scoresB={form.scoresB}
          />
        </div>
      </StepCard>

      <StepConnector />

      {/* ── Step 4: Verdict ── */}
      <StepCard
        number={4} title="Verdict"
        status={verdictStatus}
        isOpen={open.verdict}
        onToggle={() => toggle('verdict')}
      >
        <div className="space-y-6">
          {/* Winner */}
          <div>
            <SectionLabel>Winner</SectionLabel>
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
          </div>

          {/* Issue Tags */}
          <div>
            <SectionLabel>Issue Tags</SectionLabel>
            <IssueTags selected={form.tags} onChange={tags => setField('tags', tags)} />
          </div>

          {/* Reasoning */}
          <div>
            <SectionLabel>Reasoning / Notes</SectionLabel>
            <textarea
              className="input-area h-28 mt-2"
              placeholder="Explain your evaluation, what made one response better, key issues noticed..."
              value={form.reasoning}
              onChange={e => setField('reasoning', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
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
              <span className="text-emerald-400 text-sm font-medium animate-fade-in">✓ Saved</span>
            )}
          </div>
        </div>
      </StepCard>
    </div>
  )
}

/* ── Criteria table (unified A vs B) ──────────────────────────── */

function CriteriaTable({ criteria, scoresA, scoresB, onScoreA, onScoreB, totalA, totalB }) {
  return (
    <div className="bg-gray-950/60 border border-gray-800/40 rounded-xl overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_164px_164px] px-4 py-2.5 border-b border-gray-800/40 bg-gray-900/40">
        <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Criterion</span>
        <span className="text-xs font-semibold text-blue-400 text-center">Response A</span>
        <span className="text-xs font-semibold text-emerald-400 text-center">Response B</span>
      </div>

      {/* Rows */}
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {criteria.map((c, i) => (
            <div
              key={c.key}
              className={`grid grid-cols-[1fr_164px_164px] items-center px-4 py-3 ${
                i < criteria.length - 1 ? 'border-b border-gray-800/30' : ''
              }`}
            >
              <span className="text-sm text-gray-300">{c.label}</span>
              <PipRow score={scoresA[c.key]} onScore={val => onScoreA(c.key, val)} color="blue" />
              <PipRow score={scoresB[c.key]} onScore={val => onScoreB(c.key, val)} color="emerald" />
            </div>
          ))}

          {/* Totals row */}
          <div className="grid grid-cols-[1fr_164px_164px] items-center px-4 py-3 bg-gray-900/40 border-t border-gray-800/50">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</span>
            <div className="text-center">
              <span className="text-xl font-bold text-blue-400 tabular-nums">{totalA}</span>
              <span className="text-xs text-gray-600">/30</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-emerald-400 tabular-nums">{totalB}</span>
              <span className="text-xs text-gray-600">/30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PipRow({ score, onScore, color }) {
  const active = color === 'blue'
    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/40 scale-110'
    : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40 scale-110'

  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map(val => (
        <button
          key={val}
          onClick={() => onScore(val === score ? 0 : val)}
          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
            score >= val ? active : 'bg-gray-800/80 text-gray-600 hover:bg-gray-700 hover:text-gray-400'
          }`}
        >
          {val}
        </button>
      ))}
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────── */

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{children}</p>
  )
}

function ResponseBlock({ label, value, onChange, color }) {
  const isBlue = color === 'blue'
  const border   = isBlue ? 'border-blue-800/40'    : 'border-emerald-800/40'
  const badge    = isBlue ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50'
                           : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50'
  const focus    = isBlue ? 'focus:border-blue-500/60' : 'focus:border-emerald-500/60'

  return (
    <div className={`rounded-xl border ${border} bg-gray-900/60 p-4`}>
      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${badge}`}>
        {label}
      </span>
      <textarea
        className={`w-full h-44 bg-gray-950/60 border border-gray-800/60 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none transition-all ${focus}`}
        placeholder={`Paste ${label} here...`}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function WinnerButton({ option, selected, onClick }) {
  const cfg = {
    A:   { active: 'bg-blue-600    border-blue-500    shadow-blue-900/40',    idle: 'border-gray-700/60 hover:border-blue-700/60    hover:text-blue-300',    label: 'Response A Wins' },
    B:   { active: 'bg-emerald-600 border-emerald-500 shadow-emerald-900/40', idle: 'border-gray-700/60 hover:border-emerald-700/60 hover:text-emerald-300', label: 'Response B Wins' },
    Tie: { active: 'bg-yellow-600  border-yellow-500  shadow-yellow-900/40',  idle: 'border-gray-700/60 hover:border-yellow-700/60  hover:text-yellow-300',  label: 'Tie'             },
  }[option]

  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
        selected
          ? `${cfg.active} text-white shadow-lg`
          : `bg-gray-900/80 text-gray-400 ${cfg.idle}`
      }`}
    >
      {cfg.label}
    </button>
  )
}
