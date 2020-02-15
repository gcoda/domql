import config from './dom-config'
import { graphql } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
const schema = makeExecutableSchema(config)
const domServer = (query: string, variables = {}) =>
  graphql({
    schema,
    source: query,
    contextValue: config.context(),
    variableValues: variables,
  })

export default domServer
