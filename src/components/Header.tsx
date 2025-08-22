import React from 'react'
import { Camera, Server, Settings } from 'lucide-react'

interface HeaderProps {
  onConfigClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onConfigClick }) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Système d'Upload Photos
              </h1>
              <p className="text-gray-600">
                Stockage automatique sur serveur SMB local
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Server className="h-5 w-5" />
              <span className="text-sm font-medium">SMB Connecté</span>
            </div>
            {onConfigClick && (
              <button
                onClick={onConfigClick}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configuration SMB"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
