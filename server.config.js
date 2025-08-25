// Configuration serveur pour l'application Photo Uploader SMB
export const serverConfig = {
  // Configuration du serveur de développement
  development: {
    port: 3131,
    host: '192.168.12.200',
    cors: {
      origin: ['http://192.168.12.200:3131', 'http://localhost:3131', 'http://127.0.0.1:3131'],
      credentials: true
    }
  },

  // Configuration de production
  production: {
    port: process.env.PORT || 3131,
    host: '0.0.0.0',
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://192.168.12.200:3131', 'http://localhost:3131', 'http://127.0.0.1:3131'],
      credentials: true
    }
  },

  // Configuration SMB par défaut
  smb: {
    // Paramètres de connexion par défaut
    defaultSettings: {
      timeout: 30000, // 30 secondes
      maxConcurrentUploads: 5,
      chunkSize: 1024 * 1024, // 1MB chunks
      retryAttempts: 3,
      retryDelay: 1000 // 1 seconde
    },

    // Formats de dossiers supportés
    folderFormats: [
      {
        key: 'YYYY-MM-DD_HHhMM',
        label: 'Date et heure (2024-08-22_14h30)',
        example: '2024-08-22_14h30'
      },
      {
        key: 'YYYY/MM/DD',
        label: 'Date hiérarchique (2024/08/22)',
        example: '2024/08/22'
      },
      {
        key: 'DD-MM-YYYY_HH-MM',
        label: 'Format européen (22-08-2024_14-30)',
        example: '22-08-2024_14-30'
      },
      {
        key: 'YYYYMMDD_HHMM',
        label: 'Format compact (20240822_1430)',
        example: '20240822_1430'
      }
    ],

    // Extensions de fichiers autorisées
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
      '.tiff', '.tif', '.svg', '.ico', '.heic', '.heif'
    ],

    // Taille maximale des fichiers (en bytes)
    maxFileSize: 50 * 1024 * 1024, // 50MB

    // Validation des paramètres SMB
    validation: {
      serverAddress: {
        required: true,
        pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/,
        message: 'Adresse serveur invalide (IP ou nom de domaine requis)'
      },
      username: {
        required: true,
        minLength: 1,
        maxLength: 64,
        message: 'Nom d\'utilisateur requis (1-64 caractères)'
      },
      password: {
        required: true,
        minLength: 1,
        message: 'Mot de passe requis'
      },
      shareName: {
        required: true,
        pattern: /^[a-zA-Z0-9_\-]+$/,
        message: 'Nom de partage invalide (lettres, chiffres, _ et - uniquement)'
      },
      basePath: {
        required: false,
        pattern: /^\/[a-zA-Z0-9_\-\/]*$/,
        message: 'Chemin de base invalide (doit commencer par /)'
      }
    }
  },

  // Configuration de sécurité
  security: {
    // Code d'accès pour la configuration
    accessCode: '01071997',
    
    // Chiffrement des données sensibles en localStorage
    encryption: {
      enabled: true,
      algorithm: 'AES-GCM',
      keyDerivation: 'PBKDF2'
    },

    // Politique de mots de passe
    passwordPolicy: {
      minLength: 8,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false
    },

    // Headers de sécurité
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;"
    }
  },

  // Configuration des logs
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: 'combined',
    destinations: {
      console: true,
      file: process.env.NODE_ENV === 'production',
      filePath: './logs/app.log'
    },
    
    // Types d'événements à logger
    events: {
      uploads: true,
      errors: true,
      authentication: true,
      configuration: true
    }
  },

  // Configuration des uploads
  upload: {
    // Dossier temporaire pour les uploads
    tempDir: './temp',
    
    // Nettoyage automatique des fichiers temporaires
    cleanupInterval: 3600000, // 1 heure
    tempFileMaxAge: 7200000, // 2 heures

    // Progression des uploads
    progressUpdateInterval: 1000, // 1 seconde
    
    // Gestion des erreurs
    errorHandling: {
      maxRetries: 3,
      retryDelay: 2000,
      timeoutDuration: 60000 // 1 minute
    }
  },

  // Configuration de l'interface utilisateur
  ui: {
    // Thème par défaut
    theme: {
      primary: '#2563eb', // blue-600
      secondary: '#64748b', // slate-500
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      error: '#dc2626', // red-600
      background: '#f8fafc' // slate-50
    },

    // Paramètres d'affichage
    display: {
      maxPhotosPreview: 20,
      thumbnailSize: 150,
      animationDuration: 300
    },

    // Messages utilisateur
    messages: {
      fr: {
        uploadSuccess: 'Photo téléchargée avec succès',
        uploadError: 'Erreur lors du téléchargement',
        configSaved: 'Configuration sauvegardée',
        invalidCredentials: 'Identifiants invalides',
        connectionError: 'Erreur de connexion au serveur SMB'
      }
    }
  }
};

// Fonction pour obtenir la configuration selon l'environnement
export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return {
    ...serverConfig,
    server: serverConfig[env] || serverConfig.development
  };
};

// Fonction pour valider la configuration SMB
export const validateSMBConfig = (config) => {
  const errors = [];
  const validation = serverConfig.smb.validation;

  Object.keys(validation).forEach(field => {
    const rules = validation[field];
    const value = config[field];

    if (rules.required && (!value || value.trim() === '')) {
      errors.push({ field, message: rules.message });
      return;
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors.push({ field, message: rules.message });
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors.push({ field, message: rules.message });
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push({ field, message: rules.message });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fonction pour générer le nom de dossier selon le format
export const generateFolderName = (format, date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD_HHhMM':
      return `${year}-${month}-${day}_${hours}h${minutes}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'DD-MM-YYYY_HH-MM':
      return `${day}-${month}-${year}_${hours}-${minutes}`;
    case 'YYYYMMDD_HHMM':
      return `${year}${month}${day}_${hours}${minutes}`;
    default:
      return `${year}-${month}-${day}_${hours}h${minutes}`;
  }
};

export default serverConfig;
