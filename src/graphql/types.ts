export type NodeRoot = {
  __typename?: 'Node'
  node?: HTMLElement
  document: never
} | null
export type DocumentRoot = {
  __typename?: 'Node'
  document?: Document
  node: never
} | null
import { GraphQLResolveInfo } from 'graphql'

export type GraphQLFieldResolver<
  TSource,
  TContext,
  TArgs = { [argName: string]: any },
  TResult = any
> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>
