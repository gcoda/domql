import { NodeRoot, DocumentRoot, GraphQLFieldResolver } from '@/graphql/types'
type SelectFieldResolver = GraphQLFieldResolver<
  NodeRoot | DocumentRoot,
  { selector?: string; hasText?: string }
>
const makeSelectResolver = (all: boolean): SelectFieldResolver => (
  source,
  { selector = '*', hasText } = {}
) => {
  const parent =
    source?.__typename === 'Node'
      ? source?.node
      : source?.__typename === 'Document'
      ? source?.document
      : null

  if (!parent || !(selector || hasText)) return null
  else if (selector) {
    let nodes = all
      ? [...parent.querySelectorAll(selector)].map(node => ({
          __typename: 'Node',
          node,
        }))
      : Array({
          __typename: 'Node',
          node: parent.querySelector(selector),
        })

    if (hasText) {
      nodes = nodes.filter(node => node?.node?.textContent?.match(hasText))
    }
    return all ? nodes : nodes[0]
  }
}
export const selectAll = makeSelectResolver(true)
export const select = makeSelectResolver(false)
