import React, { useCallback, useState } from 'react'
import { Upload, Image } from 'lucide-react'

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }, [onFilesSelected, disabled])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      )
      onFilesSelected(imageFiles)
    }
    e.target.value = ''
  }, [onFilesSelected])

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
        ${isDragOver && !disabled
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="space-y-4">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
          isDragOver && !disabled ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {isDragOver && !disabled ? (
            <Upload className="h-8 w-8 text-blue-600" />
          ) : (
            <Image className="h-8 w-8 text-gray-400" />
          )}
        </div>
        
        <div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragOver && !disabled
              ? 'Déposez vos photos ici'
              : 'Glissez-déposez vos photos ou cliquez pour sélectionner'
            }
          </p>
          <p className="text-sm text-gray-500">
            Formats supportés: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>
    </div>
  )
}

export default UploadZone
