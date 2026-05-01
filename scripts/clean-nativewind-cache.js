/**
 * clean-nativewind-cache.js
 *
 * Supprime les dossiers .cache générés par react-native-css-interop (NativeWind).
 * Ces fichiers causent une erreur Metro "Failed to get SHA-1" sur EAS Build car
 * Metro les détecte comme modules mais ne peut pas les hasher.
 *
 * Ce script est exécuté en postinstall pour s'assurer que le .cache est supprimé
 * après chaque installation de dépendances, y compris sur les serveurs EAS Build.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const cacheDirs = [
  path.join(root, 'node_modules', 'react-native-css-interop', '.cache'),
  path.join(root, 'node_modules', 'nativewind', 'node_modules', 'react-native-css-interop', '.cache'),
];

let cleaned = 0;
for (const dir of cacheDirs) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`[clean-nativewind-cache] Supprimé: ${dir}`);
    cleaned++;
  }
}

if (cleaned === 0) {
  console.log('[clean-nativewind-cache] Aucun dossier .cache trouvé (normal si premier install).');
} else {
  console.log(`[clean-nativewind-cache] ${cleaned} dossier(s) .cache supprimé(s).`);
}
