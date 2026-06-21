const STORAGE_KEY = 'ai_eval_evaluations'

export function loadEvaluations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveEvaluation(form) {
  const evaluations = loadEvaluations()
  const entry = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...form,
  }
  evaluations.unshift(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations))
  return entry
}

export function deleteEvaluation(id) {
  const evaluations = loadEvaluations().filter(e => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations))
}

export function exportToCSV(evaluations) {
  const CRITERIA = [
    'instructionFollowing',
    'accuracy',
    'clarity',
    'helpfulness',
    'tone',
    'overall',
  ]

  const headers = [
    'ID',
    'Date',
    'Prompt',
    'Response A',
    'Response B',
    ...CRITERIA.map(c => `A: ${c}`),
    ...CRITERIA.map(c => `B: ${c}`),
    'A Total',
    'B Total',
    'Winner',
    'Tags',
    'Reasoning',
  ]

  const rows = evaluations.map(e => {
    const totalA = CRITERIA.reduce((sum, c) => sum + (e.scoresA?.[c] || 0), 0)
    const totalB = CRITERIA.reduce((sum, c) => sum + (e.scoresB?.[c] || 0), 0)
    return [
      e.id,
      new Date(e.createdAt).toLocaleString(),
      e.prompt,
      e.responseA,
      e.responseB,
      ...CRITERIA.map(c => e.scoresA?.[c] || 0),
      ...CRITERIA.map(c => e.scoresB?.[c] || 0),
      totalA,
      totalB,
      e.winner,
      (e.tags || []).join('; '),
      e.reasoning,
    ].map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`)
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-evaluations-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
