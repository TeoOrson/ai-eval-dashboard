const KEYS = ['instructionFollowing', 'accuracy', 'clarity', 'helpfulness', 'tone', 'overall']
const LABELS = ['Instruction', 'Accuracy', 'Clarity', 'Helpful', 'Tone', 'Overall']
const N = KEYS.length
const CX = 110, CY = 100, MAX_R = 72
const STEP = (2 * Math.PI) / N

function pt(cx, cy, r, i) {
  const a = i * STEP
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }
}

function polygon(scores) {
  return KEYS.map((k, i) => {
    const { x, y } = pt(CX, CY, ((scores?.[k] || 0) / 5) * MAX_R, i)
    return `${x},${y}`
  }).join(' ')
}

export default function RadarChart({ scoresA, scoresB }) {
  const rings = [1, 2, 3, 4, 5]
  const axes = KEYS.map((_, i) => pt(CX, CY, MAX_R, i))
  const labelPts = KEYS.map((_, i) => ({ ...pt(CX, CY, MAX_R + 18, i), label: LABELS[i] }))

  return (
    <svg viewBox="0 0 220 200" className="w-full">
      {/* Grid rings */}
      {rings.map(lvl => (
        <polygon
          key={lvl}
          points={KEYS.map((_, i) => {
            const { x, y } = pt(CX, CY, (lvl / 5) * MAX_R, i)
            return `${x},${y}`
          }).join(' ')}
          fill="none"
          stroke="#1f2937"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {axes.map(({ x, y }, i) => (
        <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#374151" strokeWidth="1" />
      ))}

      {/* B polygon */}
      <polygon
        points={polygon(scoresB)}
        fill="rgba(16, 185, 129, 0.12)"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* A polygon */}
      <polygon
        points={polygon(scoresA)}
        fill="rgba(96, 165, 250, 0.12)"
        stroke="#60a5fa"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Labels */}
      {labelPts.map(({ x, y, label }, i) => (
        <text
          key={i}
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8.5"
          fill="#6b7280"
        >
          {label}
        </text>
      ))}

      {/* Legend */}
      <rect x="6" y="184" width="8" height="3" rx="1" fill="#60a5fa" />
      <text x="17" y="187" fontSize="8" fill="#6b7280" dominantBaseline="middle">A</text>
      <rect x="30" y="184" width="8" height="3" rx="1" fill="#10b981" />
      <text x="41" y="187" fontSize="8" fill="#6b7280" dominantBaseline="middle">B</text>
    </svg>
  )
}
