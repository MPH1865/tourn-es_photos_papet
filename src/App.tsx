import React from 'react'
import PhotoUploader from '@/components/PhotoUploader'
import Header from '@/components/Header'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PhotoUploader />
      </main>
    </div>
  )
}

export default App
