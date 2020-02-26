import { Context } from '@/graphql/context'
import { GraphQLFieldResolver } from '@/graphql/types'
export default interface QueryFieldsResolver {
  [k: string]: QueryFieldResolver
}
type QueryFieldResolver<
  TArgs = { [argName: string]: any },
  TResult = any
> = GraphQLFieldResolver<null, Context, TArgs, TResult>
