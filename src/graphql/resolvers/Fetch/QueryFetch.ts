import { GraphQLFieldResolver } from 'graphql'

type FetchResolver = GraphQLFieldResolver<any, { document: Document }>
export const QueryFetch: FetchResolver = async (_, { url, init }) => {
  const response = url
    ? await fetch(`${url}`, {
        credentials: 'omit',
      })
    : {}
  return {
    __typename: 'FetchResponse',
    response,
  }
}
