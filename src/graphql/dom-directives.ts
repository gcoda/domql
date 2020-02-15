import { DirectiveResolvers } from 'graphql-directive'
type ReplaceArgs = { search: string; replacement?: string; flags?: string }

export default {
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
    const number = toFixed
      ? parseFloat(`${value}`).toFixed(toFixed)
      : parseInt(`${value}`)
    return typeof value === 'string'
      ? `${number}`
      : typeof value === 'number'
      ? number
      : number
  },
} as DirectiveResolvers