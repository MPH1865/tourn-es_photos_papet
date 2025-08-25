#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration de déploiement
const deployConfig = {
  buildDir: 'dist',
  serverPort: 3131,
  serverHost: '0.0.0.0',
  smbApiPort: 3132
};

console.log('🚀 Démarrage du déploiement...\n');

try {
  // Étape 1: Vérification des dépendances
  console.log('📦 Vérification des dépendances...');
  if (!existsSync('node_modules')) {
    console.log('Installation des dépendances...');
    execSync('npm install', { stdio: 'inherit' });
  } else {
    console.log('✅ Dépendances déjà installées');
  }

  // Étape 2: Build de production
  console.log('\n🔨 Construction de l\'application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build terminé avec succès');

  // Étape 3: Création du serveur de production
  console.log('\n🌐 Création du serveur de production...');
  
  const serverScript = `
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { serverConfig } from './server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const config = serverConfig.production;

// Configuration des headers de sécurité
app.use((req, res, next) => {
  Object.entries(serverConfig.security.headers).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
});

// Servir les fichiers statiques
app.use(express.static(join(__dirname, '${deployConfig.buildDir}')));

// Route pour toutes les autres requêtes (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '${deployConfig.buildDir}', 'index.html'));
});

const port = process.env.PORT || ${deployConfig.serverPort};
const host = process.env.HOST || '${deployConfig.serverHost}';

app.listen(port, host, () => {
  console.log(\`🚀 Serveur démarré sur http://\${host}:\${port}\`);
  console.log(\`📁 Serveur de fichiers: \${join(__dirname, '${deployConfig.buildDir}')}\`);
  console.log(\`🔒 Mode sécurisé activé\`);
});
`;

  writeFileSync('server.js', serverScript.trim());
  console.log('✅ Serveur de production créé');

  // Étape 4: Installation des dépendances backend
  console.log('\n📦 Installation des dépendances backend...');
  const backendDeps = ['express', 'multer', 'cors'];
  
  for (const dep of backendDeps) {
    try {
      execSync(`npm list ${dep}`, { stdio: 'pipe' });
      console.log(`✅ ${dep} déjà installé`);
    } catch {
      console.log(`Installation de ${dep}...`);
      execSync(`npm install ${dep}`, { stdio: 'inherit' });
      console.log(`✅ ${dep} installé`);
    }
  }

  // Étape 4b: Vérification des outils système SMB
  console.log('\n🔧 Vérification des outils SMB système...');
  try {
    execSync('which smbclient', { stdio: 'pipe' });
    console.log('✅ smbclient disponible');
  } catch {
    console.log('⚠️  smbclient non trouvé. Installation recommandée:');
    console.log('   sudo apt-get install smbclient cifs-utils');
  }

  try {
    execSync('which mount.cifs', { stdio: 'pipe' });
    console.log('✅ cifs-utils disponible');
  } catch {
    console.log('⚠️  cifs-utils non trouvé. Installation recommandée:');
    console.log('   sudo apt-get install cifs-utils');
  }

  // Étape 5: Création des dossiers nécessaires
  console.log('\n📁 Création des dossiers...');
  const dirs = ['logs', 'temp'];
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`✅ Dossier ${dir} créé`);
    } else {
      console.log(`✅ Dossier ${dir} existe déjà`);
    }
  });

  // Étape 6: Création du serveur SMB API
  console.log('\n🔌 Création du serveur SMB API...');
  
  if (!existsSync('server')) {
    mkdirSync('server');
  }

  const smbServerScript = `const express = require('express')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)
const app = express()
const PORT = ${deployConfig.smbApiPort}

// Configuration CORS
app.use(cors({
  origin: ['http://192.168.12.200:${deployConfig.serverPort}', 'http://localhost:${deployConfig.serverPort}'],
  credentials: true
}))

app.use(express.json())

// Configuration multer pour l'upload de fichiers
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max par fichier
  }
})

// Fonction pour créer un dossier SMB
const createSMBFolder = async (config, folderName) => {
  const { serverAddress, username, password, shareName, basePath } = config
  const fullPath = \`//\${serverAddress}/\${shareName}\${basePath}/\${folderName}\`
  
  try {
    // Créer le point de montage temporaire
    const mountPoint = \`/tmp/smb_mount_\${Date.now()}\`
    await fs.mkdir(mountPoint, { recursive: true })
    
    // Monter le partage SMB
    const mountCmd = \`mount -t cifs //\${serverAddress}/\${shareName} \${mountPoint} -o username=\${username},password=\${password},vers=3.0\`
    await execAsync(mountCmd)
    
    // Créer le dossier
    const targetDir = path.join(mountPoint, basePath, folderName)
    await fs.mkdir(targetDir, { recursive: true })
    
    // Démonter
    await execAsync(\`umount \${mountPoint}\`)
    await fs.rmdir(mountPoint)
    
    return { success: true, path: fullPath }
  } catch (error) {
    console.error('Erreur création dossier SMB:', error)
    return { success: false, error: error.message }
  }
}

// Fonction pour copier un fichier vers SMB
const copyFileToSMB = async (config, folderName, fileName, fileBuffer) => {
  const { serverAddress, username, password, shareName, basePath } = config
  
  try {
    // Créer le point de montage temporaire
    const mountPoint = \`/tmp/smb_mount_\${Date.now()}\`
    await fs.mkdir(mountPoint, { recursive: true })
    
    // Monter le partage SMB
    const mountCmd = \`mount -t cifs //\${serverAddress}/\${shareName} \${mountPoint} -o username=\${username},password=\${password},vers=3.0\`
    await execAsync(mountCmd)
    
    // Créer le dossier si nécessaire
    const targetDir = path.join(mountPoint, basePath, folderName)
    await fs.mkdir(targetDir, { recursive: true })
    
    // Écrire le fichier
    const filePath = path.join(targetDir, fileName)
    await fs.writeFile(filePath, fileBuffer)
    
    // Démonter
    await execAsync(\`umount \${mountPoint}\`)
    await fs.rmdir(mountPoint)
    
    return { success: true, path: \`//\${serverAddress}/\${shareName}\${basePath}/\${folderName}/\${fileName}\` }
  } catch (error) {
    console.error('Erreur copie fichier SMB:', error)
    return { success: false, error: error.message }
  }
}

// Test de connexion SMB
app.post('/api/smb/test-connection', async (req, res) => {
  try {
    const { serverAddress, username, password, shareName } = req.body
    
    if (!serverAddress || !username || !password || !shareName) {
      return res.status(400).json({
        success: false,
        message: 'Configuration incomplète'
      })
    }
    
    // Test de connexion avec smbclient
    const testCmd = \`smbclient //\${serverAddress}/\${shareName} -U \${username}%\${password} -c "ls" 2>/dev/null\`
    
    try {
      await execAsync(testCmd)
      res.json({
        success: true,
        message: \`Connexion réussie au serveur \${serverAddress}\`
      })
    } catch (error) {
      res.json({
        success: false,
        message: 'Impossible de se connecter au serveur. Vérifiez vos paramètres.'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test de connexion'
    })
  }
})

// Upload de photos vers SMB
app.post('/api/smb/upload', upload.array('files'), async (req, res) => {
  try {
    const { config, folderName } = req.body
    const files = req.files
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      })
    }
    
    const parsedConfig = JSON.parse(config)
    const uploadedPaths = []
    
    // Créer le dossier de destination
    const folderResult = await createSMBFolder(parsedConfig, folderName)
    if (!folderResult.success) {
      return res.status(500).json({
        success: false,
        message: \`Erreur création dossier: \${folderResult.error}\`
      })
    }
    
    // Uploader chaque fichier
    for (const file of files) {
      const timestamp = Date.now()
      const fileName = \`\${timestamp}_\${file.originalname}\`
      
      const result = await copyFileToSMB(parsedConfig, folderName, fileName, file.buffer)
      
      if (result.success) {
        uploadedPaths.push(result.path)
      } else {
        console.error(\`Erreur upload \${file.originalname}:\`, result.error)
      }
    }
    
    if (uploadedPaths.length > 0) {
      res.json({
        success: true,
        message: \`\${uploadedPaths.length} fichier(s) uploadé(s) avec succès\`,
        paths: uploadedPaths,
        folderPath: folderResult.path
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Aucun fichier n\\'a pu être uploadé'
      })
    }
  } catch (error) {
    console.error('Erreur upload:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\\'upload des fichiers'
    })
  }
})

app.listen(PORT, '192.168.12.200', () => {
  console.log(\`Serveur SMB API démarré sur http://192.168.12.200:\${PORT}\`)
})`;

  writeFileSync('server/smbServer.js', smbServerScript);
  console.log('✅ Serveur SMB API créé');

  // Étape 7: Création des scripts de démarrage
  const startScript = `#!/bin/bash
echo "🚀 Démarrage de l'application Photo Uploader SMB..."
echo "📍 Port Frontend: ${deployConfig.serverPort}"
echo "📍 Port API SMB: ${deployConfig.smbApiPort}"
echo "🌐 Host: ${deployConfig.serverHost}"
echo ""

# Démarrer le serveur SMB API en arrière-plan
echo "Démarrage du serveur SMB API..."
node server/smbServer.js &
SMB_PID=$!

# Démarrer le serveur frontend
echo "Démarrage du serveur frontend..."
node server.js &
FRONTEND_PID=$!

# Fonction de nettoyage
cleanup() {
    echo "Arrêt des serveurs..."
    kill $SMB_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer les signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Attendre
wait
`;

  const startSmbOnlyScript = `#!/bin/bash
echo "🔌 Démarrage du serveur SMB API uniquement..."
echo "📍 Port: ${deployConfig.smbApiPort}"
echo ""
node server/smbServer.js
`;

  writeFileSync('start.sh', startScript);
  writeFileSync('start-smb.sh', startSmbOnlyScript);
  execSync('chmod +x start.sh start-smb.sh');
  console.log('✅ Scripts de démarrage créés');

  // Étape 8: Informations finales
  console.log('\n🎉 Déploiement terminé avec succès!');
  console.log('\n📋 Instructions pour démarrer les serveurs:');
  console.log('   1. Complet: ./start.sh (frontend + API SMB)');
  console.log('   2. API SMB seulement: ./start-smb.sh');
  console.log('   3. Frontend seulement: node server.js');
  console.log('   4. Via npm: npm run serve (frontend) ou npm run start-smb-server (API)');
  
  console.log(`\n🌐 L'application sera accessible sur:`);
  console.log(`   - Frontend: http://192.168.12.200:${deployConfig.serverPort}`);
  console.log(`   - API SMB: http://192.168.12.200:${deployConfig.smbApiPort}`);
  
  console.log(`\n📁 Fichiers générés:`);
  console.log('   - server.js (serveur frontend de production)');
  console.log('   - server/smbServer.js (serveur API SMB)');
  console.log('   - start.sh (démarrage complet)');
  console.log('   - start-smb.sh (API SMB uniquement)');
  console.log('   - dist/ (fichiers de production)');
  
  console.log(`\n⚠️  Prérequis système pour SMB:`);
  console.log('   - smbclient: sudo apt-get install smbclient');
  console.log('   - cifs-utils: sudo apt-get install cifs-utils');
  console.log('   - Permissions sudo pour mount/umount');

} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error.message);
  process.exit(1);
}
