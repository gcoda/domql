import { parse } from 'graphql/language/parser'
import { print } from 'graphql/language/printer'
import { visit } from 'graphql/language/visitor'
import {
  ASTNode,
  DirectiveNode,
  IntValueNode,
  FloatValueNode,
  StringValueNode,
  BooleanValueNode,
  NullValueNode,
  EnumValueNode,
  ListValueNode,
  ObjectValueNode,
  FieldNode,
  DocumentNode,
  SelectionNode,
} from 'graphql/language/ast'

type RemoveOptions = {
  directiveNames?: string[]
  filedNames?: string[]
}

const defaultValue: { [k: string]: (n: any) => any } = {
  StringValue: (node: StringValueNode) => node.value,
  IntValue: (node: IntValueNode) => {
    const v = parseInt(node.value)
    if (!isNaN(v)) return v
  },
  FloatValue: (node: FloatValueNode) => {
    const v = parseFloat(node.value)
    if (!isNaN(v)) return v
  },
  BooleanValue: (node: BooleanValueNode) => {
    if (node.value !== undefined) {
      return Boolean(node.value)
    }
  },
  NullValue: (node: NullValueNode) => {},
  EnumValue: (node: EnumValueNode) => {},
  ListValue: (node: ListValueNode) => {},
  ObjectValue: (node: ObjectValueNode) => {},
}
type DefaultVariableValues = { [k: string]: any }
const removeFromSchema = <T extends ASTNode>(
  ast: T,
  { directiveNames = [], filedNames = [] }: RemoveOptions
): { schema: T; defaultVariables: DefaultVariableValues } => {
  const defaultVariables: DefaultVariableValues = {}
  const schema = visit(ast, {
    SelectionSet: node => {
      return {
        ...node,
        selections: [
          ...node.selections.filter(s =>
            s.kind === 'Field' ? s.name.value !== '__typename' : true
          ),
          {
            kind: 'Field',
            name: { kind: 'Name', value: '__typename' },
            arguments: [],
            directives: [],
          },
        ] as SelectionNode[],
      }
    },
    VariableDefinition: node => {
      const kind = node.defaultValue?.kind
      const getDefaultValue = kind && defaultValue[kind]
      if (getDefaultValue) {
        const value = getDefaultValue(node.defaultValue)
        if (value !== undefined)
          defaultVariables[node.variable.name.value] = value
      }
    },
    Directive: (node: DirectiveNode) => {
      return directiveNames.includes(node.name.value) ? null : undefined
    },
    Field: (node: FieldNode) => {
      return filedNames.includes(node.name.value) ? null : undefined
    },
  })
  return { schema, defaultVariables }
}
const removeUnused = (schema: DocumentNode): DocumentNode => {
  const fragmentsInSelection: string[] = []
  visit(schema, {
    FragmentSpread: node => fragmentsInSelection.push(node.name.value),
  })
  return {
    ...schema,
    definitions: schema.definitions
      .filter(def => {
        if (def.kind === 'FragmentDefinition') {
          return fragmentsInSelection.includes(def.name.value)
        }
        return true
      })
      .map(operation => {
        if (operation.kind === 'OperationDefinition') {
          const variablesInSelection: string[] = []
          visit(operation.selectionSet, {
            Variable: node => variablesInSelection.push(node.name.value),
          })
          return {
            ...operation,
            variableDefinitions: operation.variableDefinitions?.filter(def =>
              variablesInSelection.includes(def.variable.name.value)
            ),
          }
        }
        return operation
      }),
  }
}
export const removeDeferred = (query: string) => {
  const astNodes = parse(query)
  const { schema, defaultVariables } = removeFromSchema(astNodes, {
    directiveNames: ['validate', 'output'],
    filedNames: ['fetch'],
  })
  const noUnusedVariables = removeUnused(schema)
  return { query: print(noUnusedVariables), defaultVariables }
}
