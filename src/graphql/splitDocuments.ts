export type DomQlRequestBase = {
  query: string
  variables?: { [k: string]: any }
}

import { parse } from 'graphql/language/parser'
import { print } from 'graphql/language/printer'
import { visit } from 'graphql/language/visitor'
import { ASTNode } from 'graphql/language/ast'
const findAllVariables = (ast: ASTNode) => {
  const variables: string[] = []
  visit(ast, {
    enter: node =>
      node.kind === 'Variable'
        ? //
          variables.push(node.name.value)
        : undefined,
  })
  return variables
}
const removeVariables = (ast: ASTNode, variables: string[]) =>
  visit(ast, {
    enter: node =>
      node.kind === 'VariableDefinition' &&
      !variables.includes(node.variable.name.value)
        ? null
        : undefined,
  })

/*
 */
import {
  SelectionNode,
  ValueNode,
  OperationDefinitionNode,
  FieldNode,
} from 'graphql'

const documentLocationValue = (sel: SelectionNode): null | ValueNode =>
  (sel.kind == 'Field' &&
    sel.name.value === 'document' &&
    sel.arguments?.find(arg => arg.name.value === 'location')?.value) ||
  null

const isDocumentField = (sel: SelectionNode): sel is FieldNode =>
  sel.kind == 'Field' && sel.name.value === 'document'

export const splitByDocumentField = ({
  query,
  variables,
}: DomQlRequestBase) => {
  const { definitions, ...parsedQuery } = parse(query)

  const operations = definitions.filter(
    (def): def is OperationDefinitionNode => def.kind === 'OperationDefinition'
  )
  const otherDefinitions = definitions.filter(
    def => def.kind !== 'OperationDefinition'
  )
  const definitionsByDocument = operations.map(def =>
    def.selectionSet.selections
      .filter(isDocumentField)
      .map((selection, index) => {
        const variablesInSelection = findAllVariables(selection)

        return {
          ...removeVariables(def, variablesInSelection),
          name:
            def.name?.kind === 'Name'
              ? {
                  ...def.name,
                  value: def.name?.value
                    ? [
                        def.name?.value || `Anonymous${index}`,
                        selection.name.value,
                        selection.alias?.value,
                      ]
                        .filter(Boolean)
                        .join('_')
                    : `Anonymous${index}`,
                }
              : undefined,
          selectionSet: {
            ...def.selectionSet,
            selections: [
              selection,
              ...def.selectionSet.selections.filter(x => !isDocumentField(x)),
            ],
          },
        }
      })
  )
  const queries = Array.isArray(definitionsByDocument)
    ? definitionsByDocument.reduce((a, c) => a.concat(c), [])
    : []
  return queries.map(d => {
    const locationValue = documentLocationValue(d.selectionSet.selections[0])
    return {
      variables,
      location:
        locationValue?.kind == 'Variable'
          ? variables?.[locationValue.name.value]
          : locationValue?.kind === 'StringValue'
          ? locationValue.value
          : null,
      query: print({ definitions: [d, ...otherDefinitions], ...parsedQuery }),
    }
  })
}
