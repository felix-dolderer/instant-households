// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // eslint-plugin-react@7.37.x calls context.getFilename() when version is "detect";
    // that API was removed in ESLint 10, so pin the version to match package.json.
    settings: {
      react: {
        version: '19.2',
      },
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
