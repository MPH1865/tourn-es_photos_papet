import React, { useState } from 'react'
import PhotoUploader from '@/components/PhotoUploader'
import Header from '@/components/Header'
import CodeAccess from '@/components/CodeAccess'
import SMBConfig from '@/components/SMBConfig'

type AppView = 'main' | 'code-access' | 'config'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('main')

  const handleConfigAccess = () => {
    setCurrentView('code-access')
  }

  const handleAccessGranted = () => {
    setCurrentView('config')
  }

  const handleBackToMain = () => {
    setCurrentView('main')
  }

  if (currentView === 'code-access') {
    return <CodeAccess onAccessGranted={handleAccessGranted} onBack={handleBackToMain} />
  }

  if (currentView === 'config') {
    return <SMBConfig onBack={handleBackToMain} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header onConfigClick={handleConfigAccess} />
      <main className="container mx-auto px-4 py-8">
        <PhotoUploader />
      </main>
    </div>
  )
}

export default App
