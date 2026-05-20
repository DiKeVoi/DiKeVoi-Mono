const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Required for web: enables .web.ts/.web.js platform-specific file resolution.
// Without this, Metro ignores web overrides and Fabric components try to call
// codegenNativeComponent which react-native-web doesn't export.
config.resolver.platforms = [...(config.resolver.platforms ?? []), "web"];

// react-native-maps has no web index — its main entry eagerly loads Fabric specs
// that crash on web. Redirect the entire package to a stub shim on web.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return {
      filePath: path.resolve(__dirname, "shims/react-native-maps.web.js"),
      type: "sourceFile",
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./app/global.css" });