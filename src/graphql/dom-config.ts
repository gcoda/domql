import typeDefs from './dom-schema.gql'
const context = () => ({ document })
export default {
  context,
  typeDefs,
  resolvers: {
    Node: {
      attr: (root: null | NodeInternal, { name = '' }) =>
        root?.node?.getAttribute(name),
      text: (root: null | NodeInternal) => root?.node?.innerText,
      html: (root: null | NodeInternal) => root?.node?.innerHTML,
      classList: (root: null | NodeInternal) =>
        root?.node?.getAttribute('class')?.split(' '),
      select: (root: null | NodeInternal, { selector = 'body' }) => {
        const parent = root?.node || document
        return {
          node: parent.querySelector(selector),
        }
      },
      selectAll: (root: null | NodeInternal, { selector = 'div' }) => {
        const parent = root?.node || document
        return [...parent.querySelectorAll(selector)].map(node => ({
          node,
        }))
      },
    },
    Document: {
      title: ({ document }) => document.title,
      referrer: ({ document }) => document.referrer,
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
