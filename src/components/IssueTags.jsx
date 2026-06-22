const ALL_TAGS = [
  { id: 'inaccurate', label: 'Inaccurate', color: 'red' },
  { id: 'vague', label: 'Vague', color: 'yellow' },
  { id: 'too-long', label: 'Too Long', color: 'orange' },
  { id: 'too-short', label: 'Too Short', color: 'orange' },
  { id: 'unsafe', label: 'Unsafe', color: 'red' },
  { id: 'missed-instruction', label: 'Missed Instruction', color: 'red' },
  { id: 'off-topic', label: 'Off Topic', color: 'yellow' },
  { id: 'poor-format', label: 'Poor Formatting', color: 'gray' },
  { id: 'repetitive', label: 'Repetitive', color: 'gray' },
  { id: 'hallucination', label: 'Hallucination', color: 'red' },
  { id: 'wrong-tone', label: 'Wrong Tone', color: 'yellow' },
  { id: 'incomplete', label: 'Incomplete', color: 'orange' },
]

const colorMap = {
  red: {
    base: 'bg-red-950/40 border-red-800/40 text-red-400',
    active: 'bg-red-700/60 border-red-500 text-red-200',
  },
  yellow: {
    base: 'bg-yellow-950/40 border-yellow-800/40 text-yellow-500',
    active: 'bg-yellow-700/60 border-yellow-500 text-yellow-100',
  },
  orange: {
    base: 'bg-orange-950/40 border-orange-800/40 text-orange-400',
    active: 'bg-orange-700/60 border-orange-500 text-orange-100',
  },
  gray: {
    base: 'bg-gray-800/60 border-gray-700 text-gray-400',
    active: 'bg-gray-600/60 border-gray-400 text-gray-100',
  },
}

export default function IssueTags({ selected, onChange }) {
  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter(t => t !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2 p-4 bg-gray-900/60 border border-gray-800/50 rounded-xl backdrop-blur-sm">
      {ALL_TAGS.map(tag => {
        const isActive = selected.includes(tag.id)
        const { base, active } = colorMap[tag.color]
        return (
          <button
            key={tag.id}
            onClick={() => toggle(tag.id)}
            className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
              isActive ? active : base + ' hover:brightness-125'
            }`}
          >
            {tag.label}
          </button>
        )
      })}
    </div>
  )
}
