import template from 'lodash/template'

type AnyRecords = { [s: string]: any }

export const evalArgs = (args: AnyRecords, context?: null | AnyRecords) => {
  return !context || !args
    ? args
    : Object.fromEntries(
        Object.entries(args).map(([arg, value]) => {
          if (typeof value !== 'string') {
            return [arg, value]
          }
          const compile = template(value)
          // _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
          try {
            return [arg, compile(context)]
          } catch (e) {
            return [arg, null]
          }
        })
      )
}

import { Resolver } from 'graphql-anywhere'

export const templateArgsResolver = (
  templateContext: null | undefined | AnyRecords,
  originalResolver: Resolver
): Resolver => (fieldName, root, args, context, info) => {
  return originalResolver(
    fieldName,
    root,
    evalArgs(args, { query: templateContext, field: root }),
    context,
    info
  )
}
