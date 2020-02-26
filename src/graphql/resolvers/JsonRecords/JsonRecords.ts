import { GraphQLFieldResolver } from 'graphql'
type JsonRecordsResolver = GraphQLFieldResolver<any, { document: Document }>
export const JsonRecords: JsonRecordsResolver = async records => {
  return {
    __typename: 'JsonRecords',
    records,
  }
}

type JsonRecordsFieldResolver = GraphQLFieldResolver<
  { records?: any },
  any,
  { name: string }
>
export default {
  get: async (source, { name }) => {
    return source?.records?.[name]
  },
} as { [k: string]: JsonRecordsFieldResolver }
