const domServerModule = () =>
  import(
    /* webpackChunkName: "domServer" */
    /* webpackMode: "eager" */
    '../graphql/dom-server'
  )
const domServer = (() => domServerModule().then(exec => exec.default))()
browser.runtime.onMessage.addListener(async (message: any, sender: any) => {
  const dom = await domServer
  return dom(message.query)
})

/*
const gql = String.raw
domServerModule()
  .then(exec => exec.default)
  .then(domServer => {
    domServer(gql`
      query allLinks {
        document {
          title
          links: selectAll(selector: "a") {
            href: attr(name: "href")
            text
          }
        }
      }
    `).then(({ data, errors }) => console.log(data))
  })

  */
