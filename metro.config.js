const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require('path'); // Add this

const defaultConfig = getDefaultConfig(__dirname);

// Define the paths to your local modules
const localModules = [
  path.resolve(__dirname, 'modules'),
];

const config = mergeConfig(defaultConfig, {
  // 1. Watch the folders so Metro sees file changes
  watchFolders: localModules,
  
  resolver: {
    assetExts: defaultConfig.resolver.assetExts,
    // 2. Tell the resolver where to look for module imports
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      ...localModules,
    ],
  },
});

module.exports = withNativeWind(config, { input: "./global.css" });