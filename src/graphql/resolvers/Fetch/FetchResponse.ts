import { GraphQLFieldResolver } from 'graphql'
import Maybe from 'graphql/tsutils/Maybe'
type FetchFieldResolver = GraphQLFieldResolver<
  { response: Maybe<Response> },
  { document: Document }
>
export const status: FetchFieldResolver = source => {
  return source.response?.status
}
export const statusText: FetchFieldResolver = source => {
  return source.response?.statusText
}

export const url: FetchFieldResolver = source => {
  return source.response?.url
}

export const text: FetchFieldResolver = async source => {
  const response = source.response?.clone()

  return response?.text()
}
export const headers: FetchFieldResolver = async source => {
  //
  if (source.response) {
    const records = Object.fromEntries([...source.response.headers])
    return {
      records,
      __typename: 'JsonRecords',
    }
  }
}
export const json: FetchFieldResolver = async source => {
  const response = source.response?.clone()
  try {
    const json = await response?.json()
    return json
  } catch (e) {
    return null
  }
}

export const document: FetchFieldResolver = async source => {
  const response = source.response?.clone()
  const text = await response?.text()
  if (text) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')
    return {
      __typename: 'Document',
      document: doc,
    }
  }
  return null
}
