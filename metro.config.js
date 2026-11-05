const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const fs = require("fs");
const path = require("path");
// Metro must see NativeWind's generated files when it first indexes the tree.
const cacheDir = path.join(path.dirname(require.resolve("react-native-css-interop/package.json")), ".cache");
fs.mkdirSync(cacheDir, { recursive: true });
for (const name of ["web.css", "ios.js", "android.js"]) {
  const file = path.join(cacheDir, name);
  if (!fs.existsSync(file)) fs.writeFileSync(file, "");
}
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
