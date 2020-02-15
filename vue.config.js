module.exports = {
  chainWebpack: config => {
    // GraphQL Loader
    config.module
      .rule('graphql')
      .test(/\.graphql|gql$/)
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end()
  },

  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.ts',
      title: 'Popup',
    },
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.ts',
        },
        contentScripts: {
          entries: {
            'content-script': ['src/content-scripts/content-script.ts'],
          },
        },
      },
    },
  },
}
