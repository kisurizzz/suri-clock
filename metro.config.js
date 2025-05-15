const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add custom resolver for React Navigation assets
config.resolver.extraNodeModules = {
  "missing-asset-registry-path": path.resolve(__dirname, "assets/navigation"),
};

// Ensure all required asset extensions are included
if (!config.resolver.assetExts.includes("png")) {
  config.resolver.assetExts.push("png");
}

// Disable unstable package exports
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
