/** @type {const} */
const themeColors = {
  // Ramo brand colors
  primary: { light: '#003c38', dark: '#00524d' },       // Vert forêt
  accent: { light: '#DCF21E', dark: '#DCF21E' },         // Chartreuse
  background: { light: '#F5F2EE', dark: '#151718' },     // Sable clair
  surface: { light: '#ffffff', dark: '#1e2022' },        // Blanc
  foreground: { light: '#1A1A1A', dark: '#ECEDEE' },     // Noir doux
  muted: { light: '#6B6560', dark: '#9BA1A6' },          // Gris
  border: { light: '#D3CBBF', dark: '#334155' },         // Sable
  success: { light: '#22C55E', dark: '#4ADE80' },
  warning: { light: '#F59E0B', dark: '#FBBF24' },
  error: { light: '#EF4444', dark: '#F87171' },
  // Plant state colors (used directly in components)
  terre: { light: '#8A6F48', dark: '#a8895e' },          // Mort / Terre
};

module.exports = { themeColors };
