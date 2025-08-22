import React, { useState, useCallback } from 'react'
import { Upload, Image, CheckCircle, AlertCircle, Folder } from 'lucide-react'
import UploadZone from '@/components/UploadZone'
import PhotoPreview from '@/components/PhotoPreview'
import UploadProgress from '@/components/UploadProgress'
import { uploadPhotosToSMB, generateFolderName } from '@/services/smbService'

interface UploadedPhoto {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  path?: string
  error?: string
}

const PhotoUploader: React.FC = () => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<string>('')

  const handleFilesSelected = useCallback((files: File[]) => {
    const newPhotos: UploadedPhoto[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0
    }))

    setPhotos(prev => [...prev, ...newPhotos])
  }, [])

  const handleUpload = async () => {
    const pendingPhotos = photos.filter(photo => photo.status === 'pending')
    if (pendingPhotos.length === 0) return

    setIsUploading(true)

    try {
      const folderName = generateFolderName()
      setCurrentFolder(folderName)

      for (const photo of pendingPhotos) {
        setPhotos(prev => prev.map(p => 
          p.id === photo.id 
            ? { ...p, status: 'uploading', progress: 0 }
            : p
        ))

        try {
          const result = await uploadPhotosToSMB([photo.file], folderName, (progress) => {
            setPhotos(prev => prev.map(p => 
              p.id === photo.id 
                ? { ...p, progress }
                : p
            ))
          })

          setPhotos(prev => prev.map(p => 
            p.id === photo.id 
              ? { ...p, status: 'success', progress: 100, path: result.paths[0] }
              : p
          ))
        } catch (error) {
          setPhotos(prev => prev.map(p => 
            p.id === photo.id 
              ? { ...p, status: 'error', error: error instanceof Error ? error.message : 'Erreur inconnue' }
              : p
          ))
        }
      }
    } finally {
      setIsUploading(false)
    }
  }


  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id)
      if (photo) {
        URL.revokeObjectURL(photo.preview)
      }
      return prev.filter(p => p.id !== id)
    })
  }

  const clearAll = () => {
    photos.forEach(photo => URL.revokeObjectURL(photo.preview))
    setPhotos([])
    setCurrentFolder('')
  }

  const pendingCount = photos.filter(p => p.status === 'pending').length
  const successCount = photos.filter(p => p.status === 'success').length
  const errorCount = photos.filter(p => p.status === 'error').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Image className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Upload de Photos
            </h2>
          </div>
          
          {currentFolder && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              <Folder className="h-4 w-4" />
              <span>Dossier: {currentFolder}</span>
            </div>
          )}
        </div>

        <UploadZone onFilesSelected={handleFilesSelected} disabled={isUploading} />

        {photos.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  {photos.length} photo{photos.length > 1 ? 's' : ''}
                </span>
                {successCount > 0 && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{successCount} réussie{successCount > 1 ? 's' : ''}</span>
                  </div>
                )}
                {errorCount > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorCount} échouée{errorCount > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isUploading}
                >
                  Tout effacer
                </button>
                {pendingCount > 0 && (
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>
                      {isUploading ? 'Upload en cours...' : `Uploader ${pendingCount} photo${pendingCount > 1 ? 's' : ''}`}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map(photo => (
                <PhotoPreview
                  key={photo.id}
                  photo={photo}
                  onRemove={removePhoto}
                />
              ))}
            </div>

            {isUploading && <UploadProgress />}
          </div>
        )}
      </div>
    </div>
  )
}

export default PhotoUploader
