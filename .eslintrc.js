module.exports = {
  parser: 'vue-eslint-parser',
  plugins: [
    '@typescript-eslint',
    'prettier',
    'graphql',
    // 'jest'
  ],

  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:vue/essential',
    '@vue/prettier',
    '@vue/typescript',
  ],

  env: {
    node: true,
    browser: true,
    es6: true,
    commonjs: true,
    webextensions: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
}
