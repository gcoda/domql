import gql from 'graphql-tag'
import { graphql } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { addDirectiveResolveFunctionsToSchema } from 'graphql-directive'
import { Resolver as AnyResolver } from 'graphql-anywhere'
import { graphql as anyGraphql } from 'graphql-anywhere/lib/async'

import directiveResolvers from './dom-directives'
import config from './dom-config'
import { removeDeferred } from './removeDeferred'

const schema = makeExecutableSchema({
  typeDefs: config.typeDefs,
  resolvers: config.resolvers,
  allowUndefinedInResolve: true,
  resolverValidationOptions: {},
})

addDirectiveResolveFunctionsToSchema(schema, directiveResolvers)

import fieldResolver from './resolvers/deferred'

import { templateArgsResolver } from './templateArgs'

const resolver: AnyResolver = async (fieldName, root, args, ctx, info) => {
  const key = info.resultKey || fieldName
  const source = await root

  const resolved = await fieldResolver(fieldName, source, args, ctx, info)

  const fieldValueSource = resolved !== null ? resolved : source?.[key]

  const fieldValue = !info.directives
    ? fieldValueSource
    : await Object.entries(info.directives).reduce(
        (field, [directiveName, directiveArgs]) =>
          !directiveResolvers[directiveName]
            ? field
            : directiveResolvers[directiveName](
                () => field,
                {},
                directiveArgs,
                ctx
              ),
        fieldValueSource
      )

  return fieldValue ?? null
}

const domServer = async (
  sourceQuery: string,
  variables = {},
  outputs: any[] = []
) => {
  const { query, defaultVariables } = removeDeferred(sourceQuery)
  const variableValues = { ...defaultVariables, ...variables }
  const contextValue = config.context({ outputs })
  const documentResult = await graphql({
    schema,
    source: query,
    rootValue: {},
    contextValue,
    variableValues,
  })
  if (sourceQuery.match('__schema')) {
    return documentResult
  }
  const result = await anyGraphql(
    templateArgsResolver(documentResult.data, resolver),
    gql(sourceQuery),
    documentResult.data,
    contextValue,
    variableValues
  )
    .then(data => ({ data, errors: documentResult.errors, outputs }))
    .catch(e => {
      return {
        outputs,
        data: documentResult.data,
        errors: !documentResult.errors?.length
          ? [{ message: e.message }]
          : [...documentResult.errors, { message: e.message }],
      }
    })
  return result
}
export default domServer
