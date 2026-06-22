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

  const promptStatus    = form.prompt.trim() ? 'complete' : 'empty'
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
      <StepCard number={1} title="Prompt" status={promptStatus} isOpen={open.prompt} onToggle={() => toggle('prompt')}>
        <textarea
          className="input-area h-28"
          placeholder="Paste the prompt / task given to the AI..."
          value={form.prompt}
          onChange={e => setField('prompt', e.target.value)}
        />
      </StepCard>

      <StepConnector />

      {/* ── Step 2: Responses ── */}
      <StepCard number={2} title="Responses" status={responsesStatus} isOpen={open.responses} onToggle={() => toggle('responses')}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResponseBlock label="Response A" color="violet" value={form.responseA} onChange={v => setField('responseA', v)} />
          <ResponseBlock label="Response B" color="amber"  value={form.responseB} onChange={v => setField('responseB', v)} />
        </div>
      </StepCard>

      <StepConnector />

      {/* ── Step 3: Scoring ── */}
      <StepCard number={3} title="Scoring" status={scoringStatus} isOpen={open.scoring} onToggle={() => toggle('scoring')}>
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
          <ScoreComparison totalA={totalA} totalB={totalB} scoresA={form.scoresA} scoresB={form.scoresB} />
        </div>
      </StepCard>

      <StepConnector />

      {/* ── Step 4: Verdict ── */}
      <StepCard number={4} title="Verdict" status={verdictStatus} isOpen={open.verdict} onToggle={() => toggle('verdict')}>
        <div className="space-y-6">
          <div>
            <SectionLabel>Winner</SectionLabel>
            <div className="flex flex-wrap gap-3 mt-2">
              {['A', 'B', 'Tie'].map(option => (
                <WinnerButton key={option} option={option} selected={form.winner === option} onClick={() => setField('winner', option)} />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Issue Tags</SectionLabel>
            <IssueTags selected={form.tags} onChange={tags => setField('tags', tags)} />
          </div>

          <div>
            <SectionLabel>Reasoning / Notes</SectionLabel>
            <textarea
              className="input-area h-28 mt-2"
              placeholder="Explain your evaluation, what made one response better, key issues noticed..."
              value={form.reasoning}
              onChange={e => setField('reasoning', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-lg font-medium transition-all shadow-md shadow-cyan-200"
            >
              Save Evaluation
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg font-medium transition-colors border border-slate-200"
            >
              Reset
            </button>
            {saved && (
              <span className="text-emerald-600 text-sm font-medium animate-fade-in">✓ Saved</span>
            )}
          </div>
        </div>
      </StepCard>
    </div>
  )
}

/* ── Criteria table ─────────────────────────────────────────── */

function CriteriaTable({ criteria, scoresA, scoresB, onScoreA, onScoreB, totalA, totalB }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="grid grid-cols-[1fr_164px_164px] px-4 py-2.5 border-b border-slate-100 bg-slate-50">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Criterion</span>
        <span className="text-xs font-semibold text-violet-600 text-center">Response A</span>
        <span className="text-xs font-semibold text-amber-600 text-center">Response B</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {criteria.map((c, i) => (
            <div
              key={c.key}
              className={`grid grid-cols-[1fr_164px_164px] items-center px-4 py-3 ${
                i < criteria.length - 1 ? 'border-b border-slate-100' : ''
              } ${i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
            >
              <span className="text-sm text-slate-700">{c.label}</span>
              <PipRow score={scoresA[c.key]} onScore={val => onScoreA(c.key, val)} color="violet" />
              <PipRow score={scoresB[c.key]} onScore={val => onScoreB(c.key, val)} color="amber" />
            </div>
          ))}

          <div className="grid grid-cols-[1fr_164px_164px] items-center px-4 py-3 bg-slate-50 border-t border-slate-200">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total</span>
            <div className="text-center">
              <span className="text-xl font-bold text-violet-600 tabular-nums">{totalA}</span>
              <span className="text-xs text-slate-400">/30</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-amber-600 tabular-nums">{totalB}</span>
              <span className="text-xs text-slate-400">/30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PipRow({ score, onScore, color }) {
  const active = color === 'violet'
    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 scale-110'
    : 'bg-amber-500 text-white shadow-sm shadow-amber-200 scale-110'

  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map(val => (
        <button
          key={val}
          onClick={() => onScore(val === score ? 0 : val)}
          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
            score >= val ? active : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
          }`}
        >
          {val}
        </button>
      ))}
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function SectionLabel({ children }) {
  return <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{children}</p>
}

function ResponseBlock({ label, value, onChange, color }) {
  const isViolet = color === 'violet'
  const border = isViolet ? 'border-violet-200' : 'border-amber-200'
  const badge  = isViolet
    ? 'bg-violet-100 text-violet-700 border border-violet-200'
    : 'bg-amber-100 text-amber-700 border border-amber-200'
  const focus  = isViolet
    ? 'focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
    : 'focus:border-amber-400 focus:ring-2 focus:ring-amber-100'

  return (
    <div className={`rounded-xl border ${border} bg-white p-4 shadow-sm`}>
      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${badge}`}>
        {label}
      </span>
      <textarea
        className={`w-full h-44 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none transition-all ${focus}`}
        placeholder={`Paste ${label} here...`}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function WinnerButton({ option, selected, onClick }) {
  const cfg = {
    A:   { active: 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200', idle: 'bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600', label: 'Response A Wins' },
    B:   { active: 'bg-amber-500  border-amber-500  text-white shadow-md shadow-amber-200',  idle: 'bg-white border-slate-200 text-slate-600 hover:border-amber-300  hover:text-amber-600',  label: 'Response B Wins' },
    Tie: { active: 'bg-cyan-600   border-cyan-600   text-white shadow-md shadow-cyan-200',   idle: 'bg-white border-slate-200 text-slate-600 hover:border-cyan-300   hover:text-cyan-600',   label: 'Tie'             },
  }[option]

  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all ${selected ? cfg.active : cfg.idle}`}
    >
      {cfg.label}
    </button>
  )
}
