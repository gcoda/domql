import { validateSchema } from 'jsonschema-formatter'
import { DirectiveResolver } from 'graphql-directive'

import cloneDeep from 'lodash/cloneDeep'
import { GraphQLResolveInfo } from 'graphql'
const convertProps = (schema: any): any => ({
  ...schema,
  ...(schema?.items ? { items: convertProps(schema?.items) } : {}),
  ...(schema?.properties
    ? {
        properties: Object.fromEntries(
          schema.properties.map(
            ({ name, ...property }: { [k: string]: any }) => [
              name,
              convertProps(property),
            ]
          )
        ),
      }
    : {}),
})
const stringPath = (
  info: GraphQLResolveInfo['path'],
  root: Array<number | string> = []
): Array<number | string> => {
  if (info.prev) {
    return stringPath(info.prev, [info.key, ...root])
  } else {
    return [info.key, ...root]
  }
}
export const validate: DirectiveResolver = async (
  resolve,
  _,
  args,
  source,
  info
) => {
  const schema = convertProps(args.schema)
  schema.id = '/' + Math.random().toString()

  const value = await resolve()
  const data = cloneDeep(value)
  // console.log({ data, value, resolve })

  // const tData = info.fieldNodes
  // const tData = info.parentType.getFields()
  // console.log({ directiveArgs, args, source, info, value }, tData)
  return validateSchema(data, schema, {})
    .then(() => data)
    .catch(result => {
      if (args.throw) {
        // const message = result?.errors?.[0]?.error || 'failed'
        const error = new Error(`@validate ${info?.fieldName}`)
        throw error
      } else {
        return null
      }
    })
    .catch(() => null)
}
