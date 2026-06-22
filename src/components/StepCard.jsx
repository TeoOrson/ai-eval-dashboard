export default function StepCard({ number, title, status, isOpen, onToggle, children }) {
  const badge = {
    empty: {
      ring: 'bg-slate-100 text-slate-400 border-slate-300',
      pill: null,
    },
    active: {
      ring: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      pill: <span className="text-xs text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full font-medium">In progress</span>,
    },
    complete: {
      ring: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      pill: <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">✓ Done</span>,
    },
  }[status]

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
      status === 'active'   ? 'border-cyan-200 shadow-cyan-100/60'     :
      status === 'complete' ? 'border-emerald-200 shadow-emerald-50'   :
      'border-slate-200'
    }`}>
      <button
        className="w-full px-5 py-4 flex items-center gap-3.5 text-left hover:bg-slate-50/70 transition-colors group"
        onClick={onToggle}
      >
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${badge.ring}`}>
          {status === 'complete' ? '✓' : number}
        </span>
        <span className="text-sm font-semibold text-slate-800 flex-1">{title}</span>
        {badge.pill}
        <span className="text-slate-300 text-xs group-hover:text-slate-400 transition-colors ml-1">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-5 py-5 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

export function StepConnector() {
  return (
    <div className="pl-5 flex">
      <div className="w-7 flex justify-center">
        <div className="w-px h-5 bg-gradient-to-b from-slate-200 to-slate-100" />
      </div>
    </div>
  )
}
