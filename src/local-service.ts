import gql from 'graphql-tag'
export const localService = {
  name: 'hello',
  typeDefs: gql`
    scalar DOMNode
    type Node {
      node: DOMNode
    }
    extend type Query {
      select(query: String): Node
    }
  `,
  resolvers: {
    Query: {
      select: (_: object, { query = 'body' }) => {
        return {
          node: document.querySelector(query),
        }
      },
    },
  },
}
