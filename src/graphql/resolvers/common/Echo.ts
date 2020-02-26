export const echo = (_: any, attrs?: { [k: string]: any }) => {
  if (!attrs) return null
  else if (typeof attrs.parse === 'string') {
    try {
      return JSON.parse(`${attrs.parse}`)
    } catch (e) {
      return null
    }
  } else if (attrs.array && Array.isArray(attrs.array)) {
    return attrs.array
  } else if (attrs.json !== undefined) {
    return attrs.json
  } else if (attrs.string !== undefined) {
    return attrs.string
  } else if (attrs.boolean !== undefined) {
    return attrs.boolean
  } else if (attrs.number !== undefined) {
    return attrs.number
  }
  return null
}
