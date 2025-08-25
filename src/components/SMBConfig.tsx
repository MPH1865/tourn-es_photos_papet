import React, { useState, useEffect } from 'react'
import { Settings, Server, Folder, Save, Eye, EyeOff, ArrowLeft, Wifi, WifiOff } from 'lucide-react'
import { checkSMBConnection } from '@/services/smbService'

interface SMBConfigProps {
  onBack: () => void
}

interface SMBSettings {
  serverAddress: string
  username: string
  password: string
  shareName: string
  basePath: string
  folderNameFormat: string
}

const SMBConfig: React.FC<SMBConfigProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<SMBSettings>({
    serverAddress: localStorage.getItem('smb_server') || '',
    username: localStorage.getItem('smb_username') || '',
    password: localStorage.getItem('smb_password') || '',
    shareName: localStorage.getItem('smb_share') || 'photos',
    basePath: localStorage.getItem('smb_basepath') || '/uploads',
    folderNameFormat: localStorage.getItem('smb_folder_format') || 'YYYY-MM-DD_HHhMM'
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleInputChange = (field: keyof SMBSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Sauvegarder dans localStorage
    localStorage.setItem('smb_server', settings.serverAddress)
    localStorage.setItem('smb_username', settings.username)
    localStorage.setItem('smb_password', settings.password)
    localStorage.setItem('smb_share', settings.shareName)
    localStorage.setItem('smb_basepath', settings.basePath)
    localStorage.setItem('smb_folder_format', settings.folderNameFormat)
    
    // Simulation de la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSaving(false)
    setSaveMessage('Configuration sauvegardée avec succès!')
    
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)
    
    try {
      const result = await checkSMBConnection()
      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({
        success: false,
        message: 'Erreur lors du test de connexion'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const formatExamples = [
    { format: 'YYYY-MM-DD_HHhMM', example: '2024-08-22_14h30' },
    { format: 'YYYY/MM/DD', example: '2024/08/22' },
    { format: 'DD-MM-YYYY_HH-MM', example: '22-08-2024_14-30' },
    { format: 'YYYYMMDD_HHMM', example: '20240822_1430' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Configuration SMB
                  </h1>
                  <p className="text-gray-600">
                    Paramètres de connexion au serveur de fichiers
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Serveur SMB */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Server className="h-5 w-5 text-blue-600" />
                  <span>Serveur SMB</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse du serveur
                    </label>
                    <input
                      type="text"
                      value={settings.serverAddress}
                      onChange={(e) => handleInputChange('serverAddress', e.target.value)}
                      placeholder="192.168.1.100 ou nom-serveur"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du partage
                    </label>
                    <input
                      type="text"
                      value={settings.shareName}
                      onChange={(e) => handleInputChange('shareName', e.target.value)}
                      placeholder="photos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={settings.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="utilisateur"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={settings.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organisation des dossiers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Folder className="h-5 w-5 text-blue-600" />
                  <span>Organisation des dossiers</span>
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chemin de base
                  </label>
                  <input
                    type="text"
                    value={settings.basePath}
                    onChange={(e) => handleInputChange('basePath', e.target.value)}
                    placeholder="/uploads"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dossier racine où seront stockées les photos
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format des noms de dossiers
                  </label>
                  <select
                    value={settings.folderNameFormat}
                    onChange={(e) => handleInputChange('folderNameFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {formatExamples.map((format) => (
                      <option key={format.format} value={format.format}>
                        {format.format} (ex: {format.example})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Format automatique des dossiers créés lors de l'upload
                  </p>
                </div>
              </div>

              {/* Aperçu du chemin complet */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu du chemin complet :</h4>
                <code className="text-sm text-gray-800 bg-white px-2 py-1 rounded border">
                  \\{settings.serverAddress || 'serveur'}\{settings.shareName}{settings.basePath}\{formatExamples.find(f => f.format === settings.folderNameFormat)?.example || '2024-08-22_14h30'}
                </code>
              </div>

              {/* Test de connexion */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Test de connexion</h4>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isTestingConnection ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Test en cours...</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="h-4 w-4" />
                        <span>Tester la connexion</span>
                      </>
                    )}
                  </button>
                </div>
                
                {connectionResult && (
                  <div className={`flex items-center space-x-2 text-sm ${
                    connectionResult.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {connectionResult.success ? (
                      <Wifi className="h-4 w-4" />
                    ) : (
                      <WifiOff className="h-4 w-4" />
                    )}
                    <span>{connectionResult.message}</span>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                {saveMessage && (
                  <div className="text-green-600 text-sm font-medium">
                    {saveMessage}
                  </div>
                )}
                
                <div className="flex space-x-3 ml-auto">
                  <button
                    onClick={onBack}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SMBConfig
