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
    <div className="min-h-screen">
      <header className="border-b border-white/5 bg-black/30 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight m-0 leading-none bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
              AI Response Evaluator
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Compare and score AI responses with structured rubrics
            </p>
          </div>
          <nav className="flex gap-1 bg-gray-900/60 p-1 rounded-lg border border-gray-800/60">
            <TabButton active={activeTab === 'new'} onClick={() => setActiveTab('new')}>
              New Evaluation
            </TabButton>
            <TabButton active={activeTab === 'saved'} onClick={() => setActiveTab('saved')}>
              Saved
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
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
      }`}
    >
      {children}
    </button>
  )
}
