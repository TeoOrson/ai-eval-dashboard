export default function StepCard({ number, title, status, isOpen, onToggle, children }) {
  const badge = {
    empty: {
      ring: 'bg-gray-800/80 text-gray-500 border-gray-700',
      pill: null,
    },
    active: {
      ring: 'bg-cyan-900/40 text-cyan-400 border-cyan-700/60',
      pill: <span className="text-xs text-cyan-400 bg-cyan-900/30 border border-cyan-800/50 px-2.5 py-0.5 rounded-full font-medium">In progress</span>,
    },
    complete: {
      ring: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/60',
      pill: <span className="text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 px-2.5 py-0.5 rounded-full font-medium">✓ Done</span>,
    },
  }[status]

  return (
    <div className={`bg-gray-900/80 border rounded-xl overflow-hidden backdrop-blur-sm transition-colors ${
      status === 'active'   ? 'border-cyan-800/30'    :
      status === 'complete' ? 'border-emerald-900/40' :
      'border-gray-800/60'
    }`}>
      <button
        className="w-full px-5 py-4 flex items-center gap-3.5 text-left hover:bg-white/[0.02] transition-colors group"
        onClick={onToggle}
      >
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${badge.ring}`}>
          {status === 'complete' ? '✓' : number}
        </span>
        <span className="text-sm font-semibold text-white flex-1">{title}</span>
        {badge.pill}
        <span className="text-gray-700 text-xs group-hover:text-gray-500 transition-colors ml-1">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-800/50 px-5 py-5 animate-fade-in">
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
        <div className="w-px h-5 bg-gradient-to-b from-gray-700 to-gray-800/30" />
      </div>
    </div>
  )
}
