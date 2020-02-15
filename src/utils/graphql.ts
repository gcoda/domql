import { print } from 'graphql/language/printer'
import { parse } from 'graphql/language/parser'
export const prettyPrint = (source: string) => {
  try {
    const printed = print(parse(source))
    return { source: printed, error: null }
  } catch (e) {
    return { source, error: e.message }
  }
}
