import typeDefs from './dom-schema.gql'
const context = () => ({ document })
export default {
  context,
  typeDefs,
  resolvers: {
    Node: {
      attr: (root: null | NodeInternal, { name = '' }) =>
        root?.node?.getAttribute(name),
      text: (root: null | NodeInternal) => root?.node?.textContent,
      innerText: (root: null | NodeInternal) => root?.node?.innerText,
      html: (root: null | NodeInternal) => root?.node?.innerHTML,
      parent: ({ node }: NodeInternal) => ({ node: node?.parentElement }),
      next: (root: null | NodeInternal) => ({ node: root?.node?.nextSibling }),
      attributes: ({ node }: NodeInternal) =>
        !node?.attributes
          ? null
          : Object.fromEntries(
              [...node.attributes].map(a => [a.name, a.value])
            ),
      classList: (root: null | NodeInternal) =>
        root?.node?.getAttribute('class')?.split(' '),

      click: async ({ node }: NodeInternal, { selector, waitForSelector }) => {
        if (!selector || !node) return null
        node.click()
        if (waitForSelector) {
          let interval: null | NodeJS.Timeout = null
          let counter = 0
          await new Promise(resolve => {
            interval = setInterval(() => {
              counter++
              const el = node.parentElement?.querySelector(waitForSelector)
              if (el || counter > 30) {
                resolve()
              }
            }, 200)
          })
          if (interval) clearInterval(interval)
        }
        return {
          node,
        }
      },

      select: ({ node }: NodeInternal, { selector }) =>
        !selector ? null : { node: node?.querySelector(selector) },

      selectAll: ({ node }: NodeInternal, { selector }) =>
        !selector || !node
          ? []
          : [...node.querySelectorAll(selector)].map(node => ({ node })),
      childNodes: ({ node }: NodeInternal, { selector }) =>
        !selector || !node?.childNodes
          ? []
          : [...node.childNodes].map(node => ({ node })),
      scrollIntoView: ({ node }: NodeInternal, __, { document }) => {
        node?.scrollIntoView()
        return { document }
      },
      root: (_, __, { document }) => document,
    },
    Document: {
      title: ({ document }: DocumentInternal) => document?.title,

      select: ({ document }: DocumentInternal, { selector }) =>
        selector && document
          ? { node: document.querySelector(selector) }
          : null,

      referrer: ({ document }) => document.referrer,
      selectAll: (_, { selector }, { document }) =>
        !selector
          ? []
          : [...document.querySelectorAll(selector)].map(node => ({ node })),
    },
    Query: {
      document: async (_, { waitForSelector }, { document }) => {
        if (waitForSelector) {
          let interval: null | NodeJS.Timeout = null
          let counter = 0
          await new Promise(resolve => {
            interval = setInterval(() => {
              counter++
              const el = document.querySelector(waitForSelector)
              if (el || counter > 30) {
                resolve()
              }
            }, 200)
          })
          if (interval) clearInterval(interval)
        }
        return { document }
      },
      select: (root: null, { selector = 'body' }, context: any) => {
        return {
          node: document.querySelector(selector),
        }
      },
      selectAll: (root: null | NodeInternal, { selector = 'div' }) => {
        const parent = root?.node || document
        return [...parent.querySelectorAll(selector)].map(node => ({
          node,
        }))
      },
    },
  } as Resolvers,
}

type NodeInternal = {
  node?: HTMLElement
}
type DocumentInternal = {
  document?: Document
}
type FieldResolver = <ParentType = any, V extends { [v: string]: any } = {}>(
  root: any,
  vars: { [v: string]: any },
  ctx: ReturnType<typeof context>
) => any
type Resolvers = {
  [Type: string]: {
    [Resolver: string]: FieldResolver
  }
}
