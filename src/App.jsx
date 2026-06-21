import { useState } from 'react'
import EvaluationForm from './components/EvaluationForm'
import SavedEvaluations from './components/SavedEvaluations'
import './index.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('new')
  const [refreshKey, setRefreshKey] = useState(0)

  function handleSaved() {
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight m-0">
              AI Response Evaluator
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Compare and score AI responses with structured rubrics
            </p>
          </div>
          <nav className="flex gap-1">
            <TabButton active={activeTab === 'new'} onClick={() => setActiveTab('new')}>
              New Evaluation
            </TabButton>
            <TabButton active={activeTab === 'saved'} onClick={() => setActiveTab('saved')}>
              Saved Evaluations
            </TabButton>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'new' ? (
          <EvaluationForm onSaved={handleSaved} />
        ) : (
          <SavedEvaluations key={refreshKey} />
        )}
      </main>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-violet-600 text-white'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  )
}
