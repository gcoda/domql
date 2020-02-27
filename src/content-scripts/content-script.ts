import domServer from '../graphql/dom-server'

if (browser.runtime) {
  browser.runtime.onMessage.addListener((message: any, sender: any) => {
    if (message.query) return domServer(message.query, message.variables)
    if (message.checkPresence) return true
  })
} else if (window) {
  const makeRequest = ({
    query = '{__typename}',
    variables = {},
    outputs = [],
  } = {}) => domServer(query, variables, outputs)
  Object.assign(window, { makeRequest })
}
