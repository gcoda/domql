const introspectionQuery =
  'query IntrospectionQuery { __schema { queryType { name } mutationType { name } subscriptionType { name } types { ...FullType } directives { name description locations args { ...InputValue } } }}fragment FullType on __Type { kind name description fields(includeDeprecated: true) { name description args { ...InputValue } type { ...TypeRef } isDeprecated deprecationReason } inputFields { ...InputValue } interfaces { ...TypeRef } enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason } possibleTypes { ...TypeRef }}fragment InputValue on __InputValue { name description type { ...TypeRef } defaultValue}fragment TypeRef on __Type { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } } }}'
import domQl from '@/graphql/dom-server'
import { buildClientSchema } from 'graphql/utilities/buildClientSchema'
let memory: any
export async function fetchSchema() {
  const introspectionResult = await domQl(introspectionQuery)
  if (!introspectionResult.data) throw new Error('no introspectionResult')
  if (memory) return memory
  else {
    memory = buildClientSchema(introspectionResult.data as any)
    return memory
  }
}
