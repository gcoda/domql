import { Resolver } from 'graphql-anywhere'

import DocumentResolvers from './Document/Document'
import NodeResolvers from './Node/Node'

import { QueryFetch } from './Fetch/QueryFetch'
import * as FetchResponse from './Fetch/FetchResponse'
import JsonRecords from './JsonRecords/JsonRecords'

const deferredResolver: Resolver = (fieldName, root, args, ctx, info) => {
  if (root?.__typename === 'FetchResponse') {
    const filedResolver = FetchResponse[fieldName as keyof typeof FetchResponse]
    return filedResolver ? filedResolver(root, args, ctx, info as any) : null
  } else if (root?.__typename === 'JsonRecords') {
    const filedResolver = JsonRecords[fieldName as keyof typeof JsonRecords]
    return filedResolver ? filedResolver(root, args, ctx, info as any) : null
  } else if (fieldName === 'fetch') {
    return QueryFetch(root, args, ctx, info as any)
  } else if (!root?.[info.resultKey || fieldName]) {
    if (root?.__typename === 'Document') {
      const filedResolver = DocumentResolvers?.[fieldName]
      return filedResolver ? filedResolver(root, args, ctx, info as any) : null
    } else if (root?.__typename === 'Node') {
      const filedResolver = NodeResolvers?.[fieldName]
      const value = filedResolver
        ? filedResolver(root, args, ctx, info as any)
        : null
      return value
    }
  }
  return null
}
export default deferredResolver
