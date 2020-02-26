import { DirectiveResolvers } from 'graphql-directive'
type ReplaceArgs = { search?: string; replacement?: string; flags?: string }
import { validate } from './directives/validate'
import { Context } from '@/graphql/context'
export default {
  output: async (
    resolve,
    _,
    { name, data, includeResult, forEach },
    { output }
  ) => {
    if (includeResult) {
      const result = await resolve()
      if (forEach && Array.isArray(result)) {
        result.forEach(resolvedItem => {
          output({ name, data: data, result: resolvedItem })
        })
      } else {
        output({ name, data: data, result })
      }
      return result
    } else {
      output({ name, data: data })
      return resolve()
    }
  },
  trim: async resolve => {
    const value = await resolve()
    return typeof value === 'string' ? value.trim() : value
  },
  replace: async (
    resolve,
    __,
    { search, replacement = '', flags = '' }: ReplaceArgs
  ) => {
    const value = await resolve()
    return typeof value === 'string' && search
      ? value.replace(new RegExp(search, flags), replacement)
      : value
  },
  number: async (resolve, _, { toFixed = 0 }) => {
    const value = await resolve()
    const number = toFixed ? parseFloat(`${value}`) : parseInt(`${value}`)

    return isNaN(number) ? null : number.toFixed(toFixed)
  },
  validate,
} as DirectiveResolvers<Context>
