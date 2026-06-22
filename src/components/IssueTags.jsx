const ALL_TAGS = [
  { id: 'inaccurate',        label: 'Inaccurate',        color: 'red'    },
  { id: 'vague',             label: 'Vague',             color: 'yellow' },
  { id: 'too-long',          label: 'Too Long',          color: 'orange' },
  { id: 'too-short',         label: 'Too Short',         color: 'orange' },
  { id: 'unsafe',            label: 'Unsafe',            color: 'red'    },
  { id: 'missed-instruction',label: 'Missed Instruction',color: 'red'    },
  { id: 'off-topic',         label: 'Off Topic',         color: 'yellow' },
  { id: 'poor-format',       label: 'Poor Formatting',   color: 'gray'   },
  { id: 'repetitive',        label: 'Repetitive',        color: 'gray'   },
  { id: 'hallucination',     label: 'Hallucination',     color: 'red'    },
  { id: 'wrong-tone',        label: 'Wrong Tone',        color: 'yellow' },
  { id: 'incomplete',        label: 'Incomplete',        color: 'orange' },
]

const colorMap = {
  red:    { base: 'bg-red-50    border-red-200    text-red-600',    active: 'bg-red-500    border-red-500    text-white' },
  yellow: { base: 'bg-yellow-50 border-yellow-200 text-yellow-700', active: 'bg-yellow-400 border-yellow-400 text-white' },
  orange: { base: 'bg-orange-50 border-orange-200 text-orange-600', active: 'bg-orange-500 border-orange-500 text-white' },
  gray:   { base: 'bg-slate-100 border-slate-200  text-slate-500',  active: 'bg-slate-500  border-slate-500  text-white' },
}

export default function IssueTags({ selected, onChange }) {
  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(t => t !== id) : [...selected, id])
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      {ALL_TAGS.map(tag => {
        const isActive = selected.includes(tag.id)
        const { base, active } = colorMap[tag.color]
        return (
          <button
            key={tag.id}
            onClick={() => toggle(tag.id)}
            className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${isActive ? active : base + ' hover:brightness-95'}`}
          >
            {tag.label}
          </button>
        )
      })}
    </div>
  )
}
