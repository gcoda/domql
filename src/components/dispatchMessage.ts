type DomQuery = {
  query: string
  variables?: { [k: string]: any }
}
export const sendMessage = ({ query, variables }: DomQuery) => {
  return browser.runtime.sendMessage({ query, variables })
}
