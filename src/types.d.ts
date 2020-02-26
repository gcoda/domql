declare module 'graphql-directive' {
  import { GraphQLSchema, GraphQLResolveInfo } from 'graphql'
  type Args = { [arg: string]: undefined | any }
  type ResolveFn<S> = (args?: any) => S | Promise<S>
  export type DirectiveResolver<TContext = any, TArgs extends Args = Args> = (
    resolve: ResolveFn<any>,
    source: any,
    directiveArgs: TArgs,
    context: TContext,
    info?: GraphQLResolveInfo
  ) => Promise<any>
  export type DirectiveResolvers<TContext = any> = {
    [k: string]: DirectiveResolver<TContext>
  }
  export const addDirectiveResolveFunctionsToSchema: (
    schema: GraphQLSchema,
    directives: DirectiveResolvers
  ) => void
}

declare module 'datastore-fs' {
  import { Datastore, Key, Batch, Query, Result } from 'interface-datastore'
  export default class MemoryDatastore<Value = Buffer>
    implements Datastore<Value> {
    constructor(path: string)
    open(): Promise<void>
    put(key: Key, val: Value): Promise<void>
    get(key: Key): Promise<Value>
    has(key: Key): Promise<boolean>
    delete(key: Key): Promise<void>
    batch(): Batch<Value>
    query(q: Query<Value>): AsyncIterable<Result<Value>>
    close(): Promise<void>
  }
}
declare module 'jsonschema-formatter' {
  export const validateSchema: (
    p: any,
    schema: any,
    resCode: any
  ) => Promise<any>
}

declare module 'prismjs' {
  // @ts-ignore
  export { default } from '@types/prismjs'
}
