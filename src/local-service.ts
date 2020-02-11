/* eslint-disable @typescript-eslint/member-delimiter-style */
import gql from 'graphql-tag'
type NodeInternal = {
  node?: HTMLElement
}
export const localService = {
  name: 'hello',
  typeDefs: gql`
    scalar DOMNode
    type Node {
      node: DOMNode
      text: String
      html: String
      classList: [String]
      attr(name: String!): String
      select(query: String): Node
    }
    extend type Query {
      select(query: String): Node
    }
  `,
  resolvers: {
    Node: {
      attr: (root: null | NodeInternal, { name = '' }) =>
        root?.node?.getAttribute(name),
      text: (root: null | NodeInternal) => root?.node?.innerText,
      html: (root: null | NodeInternal) => root?.node?.innerHTML,
      classList: (root: null | NodeInternal) =>
        root?.node?.getAttribute('class')?.split(' '),
      select: (root: null | NodeInternal, { query = 'body' }) => {
        const parent = root?.node || document
        return {
          node: parent.querySelector(query),
        }
      },
    },
    Query: {
      select: (root: null, { query = 'body' }) => {
        return {
          node: document.querySelector(query),
        }
      },
    },
  },
}
