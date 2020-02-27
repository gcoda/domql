const path = require('path')
const schemaPath = path.resolve(__dirname, 'src', 'graphql', 'schema.gql')
const { SERVICE_NAME = 'DomQL' } = process.env
module.exports = {
  client: {
    service: {
      name: SERVICE_NAME,
      localSchemaFile: schemaPath,
    },
    includes: [
      './src/__test__/**/*.{js,jsx,ts,tsx,vue,gql}',
      './src/**/*.{js,jsx,ts,tsx,vue,gql}',
    ],
    excludes: [
      schemaPath,
      './src/generated/*',
      './src/generated/*',
      './dist/*',
    ],
  },
}
