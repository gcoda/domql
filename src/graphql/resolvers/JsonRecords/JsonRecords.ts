import { GraphQLFieldResolver } from 'graphql'
type JsonRecordsResolver = GraphQLFieldResolver<any, { document: Document }>
export const JsonRecords: JsonRecordsResolver = async records => {
  return {
    __typename: 'JsonRecords',
    records,
  }
}
type UnPromisify<T> = T extends Promise<infer U> ? U : T

type JsonRecordsGetResolver = GraphQLFieldResolver<
  { records?: any },
  any,
  { name: string }
>
export const get: JsonRecordsGetResolver = async (source, { name }) => {
  return source?.records?.[name]
}
