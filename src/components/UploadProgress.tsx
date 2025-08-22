import React from 'react'
import { Upload, Server } from 'lucide-react'

const UploadProgress: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
            <Server className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">
            Upload en cours vers le serveur SMB
          </p>
          <p className="text-xs text-blue-700">
            Les photos sont organisées automatiquement par date et heure
          </p>
        </div>
      </div>
    </div>
  )
}

export default UploadProgress
