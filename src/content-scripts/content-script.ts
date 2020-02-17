const domServerModule = () =>
  import(
    /* webpackChunkName: "domServer" */
    /* webpackMode: "eager" */
    '../graphql/dom-server'
  )
const domServer = (() => domServerModule().then(exec => exec.default))()
browser.runtime.onMessage.addListener(async (message: any, sender: any) => {
  const dom = await domServer
  if (message.query) return dom(message.query, message.variables)
  if (message.checkPresence) return true
})
