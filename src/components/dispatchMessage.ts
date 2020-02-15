type DomQuery = {
  query: string
  variables?: { [k: string]: any }
}
import { parse } from 'graphql/language/parser'
import { SelectionNode, ValueNode } from 'graphql'
const documentLocationValue = (sel: SelectionNode): null | ValueNode =>
  (sel.kind == 'Field' &&
    // sel.name.value === 'document' &&
    sel.arguments?.find(arg => arg.name.value === 'location')?.value) ||
  null
export const sendMessage = ({ query, variables }: DomQuery) => {
  // console.log(parse(query))
  const { definitions, ...parsedQuery } = parse(query)
  const withLocation = definitions.find(
    def =>
      def.kind === 'OperationDefinition' &&
      def.selectionSet.selections.find(documentLocationValue)
  )

  const documentField =
    withLocation?.kind === 'OperationDefinition'
      ? withLocation.selectionSet.selections.find(documentLocationValue)
      : null

  const locationArg = documentField && documentLocationValue(documentField)

  const location = !locationArg
    ? null
    : locationArg.kind === 'Variable'
    ? variables?.[locationArg.name.value]
    : locationArg.kind === 'StringValue'
    ? locationArg.value
    : null

  if (location) {
    return browser.runtime
      .sendMessage({ backgroundQuery: true, location, query, variables })
      .then(result => {
        if (result?.data) {
          return result
        } else {
          return { data: null, errors: [{ message: 'no data' }] }
        }
      })
  } else {
    return sendToActiveTab({ query, variables })
  }
}
export const sendToActiveTab = ({ query, variables }: DomQuery) => {
  return new Promise(resolve => {
    browser.windows.getCurrent().then(currentWindow => {
      const windowId = currentWindow.id
      browser.tabs.query({ active: true, windowId }).then(tab => {
        const tabId = tab[0]?.id
        try {
          if (tabId) {
            browser.tabs.sendMessage(tabId, { query, variables }).then(result =>
              result
                ? resolve({ ...result, tabId, windowId })
                : resolve({
                    data: null,
                    errors: [{ message: 'no result' }],
                    tabId,
                    windowId,
                  })
            )
          }
        } catch (e) {
          resolve({ data: null, errors: [{ message: e.message }] })
        }
      })
    })
  })
}
