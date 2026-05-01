const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Exclure les fichiers .cache générés par react-native-css-interop (NativeWind).
// Ces fichiers causent une erreur Metro "Failed to get SHA-1" sur EAS Build car
// Metro les détecte comme modules JS mais ne peut pas les hasher.
// On utilise une regex générique qui fonctionne quel que soit le chemin absolu
// (local /home/ubuntu/... ou EAS Build /home/expo/workingdir/build/...).
config.resolver = config.resolver || {};
const existingBlockList = config.resolver.blockList;
const blockListEntries = Array.isArray(existingBlockList)
  ? existingBlockList
  : existingBlockList
  ? [existingBlockList]
  : [];

config.resolver.blockList = [
  ...blockListEntries,
  // Exclure TOUT fichier dans un dossier .cache de react-native-css-interop
  /.*\/react-native-css-interop\/\.cache\/.*/,
];

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
