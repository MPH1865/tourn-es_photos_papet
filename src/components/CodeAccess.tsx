import React, { useState } from 'react'
import { Lock, Settings } from 'lucide-react'

interface CodeAccessProps {
  onAccessGranted: () => void
  onBack: () => void
}

const CodeAccess: React.FC<CodeAccessProps> = ({ onAccessGranted, onBack }) => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (code === '01071997') {
      setError('')
      onAccessGranted()
    } else {
      setError('Code incorrect')
      setIsShaking(true)
      setCode('')
      
      setTimeout(() => setIsShaking(false), 500)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8)
    setCode(value)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className={`bg-white rounded-xl shadow-lg p-8 ${isShaking ? 'animate-pulse' : ''}`}>
          <div className="text-center mb-8">
            <div className="bg-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Accès Configuration
            </h2>
            <p className="text-gray-600">
              Entrez le code d'accès pour modifier les paramètres SMB
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code d'accès
              </label>
              <input
                type="text"
                value={code}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 text-center text-lg tracking-widest border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                maxLength={8}
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-2 text-center">
                  {error}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={code.length !== 8}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Accéder</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CodeAccess
