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
      document: (_, __, { document }) => ({ document }),
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
