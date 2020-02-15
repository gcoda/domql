declare module 'graphql-directive' {
  import { GraphQLSchema } from 'graphql'

  type ResolveFn<S> = (args?: any) => S | Promise<S>
  type DirectiveResolver = (
    resolve: ResolveFn<any>,
    source: any,
    directiveArgs: any,
    context: any,
    info: any
  ) => Promise<any>
  export type DirectiveResolvers = { [k: string]: DirectiveResolver }
  export const addDirectiveResolveFunctionsToSchema: (
    schema: GraphQLSchema,
    directives: DirectiveResolvers
  ) => void
}
