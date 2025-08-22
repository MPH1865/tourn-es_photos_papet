import React from 'react'
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface Photo {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  path?: string
  error?: string
}

interface PhotoPreviewProps {
  photo: Photo
  onRemove: (id: string) => void
}

const PhotoPreview: React.FC<PhotoPreviewProps> = ({ photo, onRemove }) => {
  const getStatusIcon = () => {
    switch (photo.status) {
      case 'uploading':
        return <Loader className="h-5 w-5 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (photo.status) {
      case 'uploading':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className={`relative rounded-lg border-2 overflow-hidden transition-all duration-200 ${getStatusColor()}`}>
      <div className="aspect-square relative">
        <img
          src={photo.preview}
          alt={photo.file.name}
          className="w-full h-full object-cover"
        />
        
        {photo.status === 'uploading' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
              <div className="text-sm font-medium">{photo.progress}%</div>
            </div>
          </div>
        )}

        <button
          onClick={() => onRemove(photo.id)}
          className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
          disabled={photo.status === 'uploading'}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="absolute bottom-2 left-2">
          {getStatusIcon()}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">
            {photo.file.name}
          </h3>
          <span className="text-xs text-gray-500">
            {formatFileSize(photo.file.size)}
          </span>
        </div>

        {photo.status === 'uploading' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${photo.progress}%` }}
            />
          </div>
        )}

        {photo.status === 'success' && photo.path && (
          <p className="text-xs text-green-600 truncate">
            Sauvegardé: {photo.path}
          </p>
        )}

        {photo.status === 'error' && photo.error && (
          <p className="text-xs text-red-600">
            Erreur: {photo.error}
          </p>
        )}
      </div>
    </div>
  )
}

export default PhotoPreview
