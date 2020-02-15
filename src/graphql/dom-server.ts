import { graphql } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { addDirectiveResolveFunctionsToSchema } from 'graphql-directive'
import directiveResolvers from './dom-directives'
import config from './dom-config'

const schema = makeExecutableSchema({ ...config })
addDirectiveResolveFunctionsToSchema(schema, directiveResolvers)

const domServer = (query: string, variables = {}) =>
  graphql({
    schema,
    source: query,
    contextValue: config.context(),
    variableValues: variables,
  })

export default domServer
