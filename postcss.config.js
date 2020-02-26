const IN_PRODUCTION = process.env.NODE_ENV === 'production'

module.exports = {
  plugins: [
    require('postcss-preset-env')({ stage: 0 }),
    require('tailwindcss')(),
    IN_PRODUCTION &&
      require('@fullhuman/postcss-purgecss')({
        content: [
          `./public/**/*.html`,
          `./src/**/*.vue`,
          `./src/**/*.ts`,
          `./node_modules/codemirror/**/*.js`,
          `./node_modules/codemirror/**/*.css`,
        ],
        // content: [],
        defaultExtractor(content) {
          const contentWithoutStyleBlocks = content.replace(
            /<style[^]+?<\/style>/gi,
            ''
          )
          return (
            contentWithoutStyleBlocks.match(
              /[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g
            ) || []
          )
        },
        whitelist: ['.CodeMirror', '.cm-s-default'],
        whitelistPatterns: [
          /-(leave|enter|appear)(|-(to|from|active))$/,
          /^(?!(|.*?:)cursor-move).+-move$/,
          /cm-s/,
          /CodeMirror/,
          /^router-link(|-exact)-active$/,
        ],
      }),
    require('autoprefixer')(),
  ],
}
