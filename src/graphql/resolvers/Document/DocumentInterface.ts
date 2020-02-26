import { Context } from '@/graphql/context'
import { DocumentRoot, GraphQLFieldResolver } from '@/graphql/types'
export default interface DocumentFieldsResolver {
  [k: string]: DocumentFieldResolver
}
type DocumentFieldResolver<
  TArgs = { [argName: string]: any },
  TResult = any
> = GraphQLFieldResolver<DocumentRoot, Context, TArgs, TResult>
