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
  serverHost: '0.0.0.0'
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

  // Étape 4: Installation d'Express si nécessaire
  console.log('\n📦 Vérification d\'Express...');
  try {
    execSync('npm list express', { stdio: 'pipe' });
    console.log('✅ Express déjà installé');
  } catch {
    console.log('Installation d\'Express...');
    execSync('npm install express', { stdio: 'inherit' });
    console.log('✅ Express installé');
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

  // Étape 6: Création du script de démarrage
  const startScript = `#!/bin/bash
echo "🚀 Démarrage de l'application Photo Uploader SMB..."
echo "📍 Port: ${deployConfig.serverPort}"
echo "🌐 Host: ${deployConfig.serverHost}"
echo ""
node server.js
`;

  writeFileSync('start.sh', startScript);
  execSync('chmod +x start.sh');
  console.log('✅ Script de démarrage créé');

  // Étape 7: Informations finales
  console.log('\n🎉 Déploiement terminé avec succès!');
  console.log('\n📋 Instructions pour démarrer le serveur:');
  console.log('   1. Exécutez: node server.js');
  console.log('   2. Ou utilisez: ./start.sh');
  console.log('   3. Ou utilisez: npm run serve');
  console.log(`\n🌐 L'application sera accessible sur:`);
  console.log(`   - Local: http://localhost:${deployConfig.serverPort}`);
  console.log(`   - Réseau: http://[votre-ip]:${deployConfig.serverPort}`);
  console.log(`\n📁 Fichiers générés:`);
  console.log('   - server.js (serveur de production)');
  console.log('   - start.sh (script de démarrage)');
  console.log('   - dist/ (fichiers de production)');

} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error.message);
  process.exit(1);
}
