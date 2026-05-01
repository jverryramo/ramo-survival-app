/**
 * Postinstall fix: react-native-css-interop embeds its own copy of lightningcss
 * which tries to load a platform-specific .node binary that may not be present
 * on EAS Build macOS workers. This script patches the embedded lightningcss to
 * first try the root-level lightningcss (which has proper optional deps declared),
 * falling back to the original behavior if not found.
 */
const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-css-interop',
  'node_modules',
  'lightningcss',
  'node',
  'index.js'
);

if (!fs.existsSync(targetFile)) {
  console.log('[fix-lightningcss] Target file not found, skipping patch.');
  process.exit(0);
}

const current = fs.readFileSync(targetFile, 'utf8');

// Already patched
if (current.includes('// Patched by fix-lightningcss.js')) {
  console.log('[fix-lightningcss] Already patched, skipping.');
  process.exit(0);
}

const patched = `// Patched by fix-lightningcss.js — redirect to root lightningcss for EAS Build compatibility
try {
  const root = require('lightningcss');
  module.exports = root;
  module.exports.browserslistToTargets = require('./browserslistToTargets');
  module.exports.composeVisitors = require('./composeVisitors');
  module.exports.Features = require('./flags').Features;
} catch (e) {
  // Fallback to original behavior
  let parts = [process.platform, process.arch];
  if (process.platform === 'linux') {
    const { MUSL, family } = require('detect-libc');
    if (family === MUSL) {
      parts.push('musl');
    } else if (process.arch === 'arm') {
      parts.push('gnueabihf');
    } else {
      parts.push('gnu');
    }
  } else if (process.platform === 'win32') {
    parts.push('msvc');
  }
  if (process.env.CSS_TRANSFORMER_WASM) {
    module.exports = require('../pkg');
  } else {
    try {
      module.exports = require('lightningcss-' + parts.join('-'));
    } catch (err) {
      module.exports = require('../lightningcss.' + parts.join('-') + '.node');
    }
  }
  module.exports.browserslistToTargets = require('./browserslistToTargets');
  module.exports.composeVisitors = require('./composeVisitors');
  module.exports.Features = require('./flags').Features;
}
`;

fs.writeFileSync(targetFile, patched, 'utf8');
console.log('[fix-lightningcss] Patch applied successfully.');
