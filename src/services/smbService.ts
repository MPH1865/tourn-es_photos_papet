interface UploadResult {
  success: boolean
  paths: string[]
  folderPath: string
}

interface ProgressCallback {
  (progress: number): void
}

// Fonction pour générer le nom de dossier selon le format configuré
export const generateFolderName = (): string => {
  const format = localStorage.getItem('smb_folder_format') || 'YYYY-MM-DD_HHhMM'
  const now = new Date()
  
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('hMM', `h${minutes}`)
    .replace('-MM', `-${minutes}`)
}

export const uploadPhotosToSMB = async (
  files: File[],
  folderName: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  // Récupération des paramètres de configuration
  const serverAddress = localStorage.getItem('smb_server') || 'localhost'
  const username = localStorage.getItem('smb_username') || ''
  const password = localStorage.getItem('smb_password') || ''
  const shareName = localStorage.getItem('smb_share') || 'photos'
  const basePath = localStorage.getItem('smb_basepath') || '/uploads'
  const folderNameFormat = localStorage.getItem('smb_folder_format') || 'YYYY-MM-DD_HHhMM'
  
  console.log('🚀 Début upload vers SMB:', {
    serverAddress,
    username,
    shareName,
    basePath,
    folderName,
    filesCount: files.length
  })
  
  try {
    const API_BASE_URL = 'http://192.168.12.200:3132'
    
    const config = {
      serverAddress,
      username,
      password,
      shareName,
      basePath,
      folderNameFormat
    }
    
    console.log('📡 Envoi vers API SMB:', API_BASE_URL)
    
    const formData = new FormData()
    
    // Ajouter les fichiers
    files.forEach((file, index) => {
      formData.append(`files`, file)
      console.log(`📎 Fichier ${index + 1}: ${file.name} (${file.size} bytes)`)
    })
    
    // Ajouter la configuration
    formData.append('config', JSON.stringify(config))
    formData.append('folderName', folderName)
    
    console.log('⏳ Envoi de la requête...')
    
    const response = await fetch(`${API_BASE_URL}/api/smb/upload`, {
      method: 'POST',
      body: formData,
    })
    
    console.log('📥 Réponse reçue:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur HTTP:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('✅ Résultat API:', result)
    
    if (result.success) {
      return {
        success: true,
        paths: result.paths || [],
        folderPath: result.folderPath || `\\\\${serverAddress}\\${shareName}${basePath}\\${folderName}`
      }
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('💥 Erreur upload:', error)
    throw new Error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
  }
}

// Fonction pour créer le dossier SMB (à implémenter côté backend)
export const createSMBFolder = async (folderName: string): Promise<boolean> => {
  const serverAddress = localStorage.getItem('smb_server') || 'localhost'
  const shareName = localStorage.getItem('smb_share') || 'photos'
  const basePath = localStorage.getItem('smb_basepath') || '/uploads'
  
  console.log(`Simulation: Création du dossier ${folderName} sur \\\\${serverAddress}\\${shareName}${basePath}`)
  return true
}

// Fonction pour vérifier la connexion SMB
export const checkSMBConnection = async (): Promise<{ success: boolean; message: string }> => {
  const serverAddress = localStorage.getItem('smb_server')
  const username = localStorage.getItem('smb_username')
  const password = localStorage.getItem('smb_password')
  const shareName = localStorage.getItem('smb_share')
  const basePath = localStorage.getItem('smb_basepath') || '/uploads'
  const folderNameFormat = localStorage.getItem('smb_folder_format') || 'YYYY-MM-DD_HHhMM'
  
  console.log('🔍 Test de connexion SMB:', {
    serverAddress,
    username: username ? '***' : 'vide',
    password: password ? '***' : 'vide',
    shareName,
    basePath,
    folderNameFormat
  })
  
  if (!serverAddress || !username || !password || !shareName) {
    console.warn('⚠️ Configuration incomplète')
    return {
      success: false,
      message: 'Configuration incomplète. Veuillez remplir tous les champs obligatoires.'
    }
  }
  
  try {
    const API_BASE_URL = 'http://192.168.12.200:3132'
    
    const config = {
      serverAddress,
      username,
      password,
      shareName,
      basePath,
      folderNameFormat
    }
    
    console.log('📡 Test via API SMB:', API_BASE_URL)
    
    const response = await fetch(`${API_BASE_URL}/api/smb/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })
    
    console.log('📥 Réponse test connexion:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur HTTP test:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('✅ Résultat test:', result)
    
    return result
  } catch (error) {
    console.error('💥 Erreur test connexion:', error)
    return {
      success: false,
      message: `Erreur de connexion à l'API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }
  }
}

// Fonction pour envoyer les photos vers le serveur SMB
export const sendPhotosToSMB = async (
  photos: { file: File; path?: string }[],
  onProgress?: ProgressCallback
): Promise<{ success: boolean; message: string }> => {
  console.log('📤 Envoi des photos vers SMB:', photos.length, 'photos')
  
  try {
    const totalPhotos = photos.length
    
    for (let i = 0; i < totalPhotos; i++) {
      console.log(`📸 Traitement photo ${i + 1}/${totalPhotos}:`, photos[i].file.name)
      
      // Progression de l'envoi
      const progress = Math.round(((i + 1) / totalPhotos) * 100)
      onProgress?.(progress)
      
      // Simulation du temps d'envoi (à remplacer par l'envoi réel si nécessaire)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('✅ Envoi terminé avec succès')
    
    return {
      success: true,
      message: `${totalPhotos} photo${totalPhotos > 1 ? 's' : ''} envoyée${totalPhotos > 1 ? 's' : ''} avec succès`
    }
  } catch (error) {
    console.error('💥 Erreur envoi photos:', error)
    return {
      success: false,
      message: 'Erreur lors de l\'envoi des photos'
    }
  }
}
