const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Remove 'mjs' from the list of extensions so Metro falls back to 'js' (CommonJS)
// This perfectly fixes the `import.meta` issue in Zustand and React Query without Babel hacks!
config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== 'mjs');

module.exports = config;
