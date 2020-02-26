import { Context } from '@/graphql/context'
import { NodeRoot, GraphQLFieldResolver } from '@/graphql/types'
export default interface NodeFieldResolvers {
  [k: string]: NodeFieldResolver
}
type NodeFieldResolver<
  TArgs = { [argName: string]: any },
  TResult = any
> = GraphQLFieldResolver<NodeRoot, Context, TArgs, TResult>
