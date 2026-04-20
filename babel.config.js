// module.exports = {
//   presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
//  
// };

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["module:@react-native/babel-preset", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
     plugins: [
    'react-native-reanimated/plugin',
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env.local',
      blocklist: null,
      allowlist: null,
      safe: false,
      allowUndefined: true,
      verbose: false
    }]
  ],
  };
};



