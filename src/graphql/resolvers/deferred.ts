import { Resolver } from 'graphql-anywhere'

import Document from './Document/Document'
import Node from './Node/Node'

import { QueryFetch } from './Fetch/QueryFetch'
import * as FetchResponse from './Fetch/FetchResponse'
import JsonRecords from './JsonRecords/JsonRecords'
const resolvers = { FetchResponse, JsonRecords, Document, Node }

const deferredResolver: Resolver = (fieldName, root, args, ctx, info) => {
  // Do not resolved existing field
  if (root[info.resultKey]) return null

  const type = root?.__typename as keyof typeof resolvers
  if (!type || !fieldName) {
    return null
  } else {
    if (fieldName === 'fetch') {
      return QueryFetch(root, args, ctx, info as any)
    }
    const resolver = resolvers[type]
    if (!resolver) return null

    const field = fieldName as keyof typeof resolver
    const filedResolver = resolver[field]
    if (!filedResolver) return null

    return filedResolver(root, args, ctx, info as any)
  }
}
export default deferredResolver
