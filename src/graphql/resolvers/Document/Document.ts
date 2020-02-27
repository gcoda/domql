import { select, selectAll } from '@/graphql/resolvers/common/SelectResolver'
import { echo } from '@/graphql/resolvers/common/Echo'
import DocumentInterface from './DocumentInterface'
const mercury = () =>
  import(/* webpackChunkName: "Mercury" */ '@postlight/mercury-parser')
const Mercury = (() => mercury().then(m => m.default || m))()
// import Mercury from '@postlight/mercury-parser'
export default {
  echo,
  title: root => root?.document?.title,
  select,
  mercury: (root, { contentType = 'markdown' } = {}) => {
    if (!root?.document) return null

    return Mercury.then(mercury =>
      mercury
        .parse(document.location.href, {
          contentType,
          html: root.document?.documentElement.innerHTML,
        })
        .then(result => ({
          __typename: 'MercuryParsed',
          ...result,
        }))
    )
  },
  selectAll,
  referrer: root => root?.document?.referrer,
  location: root => root?.document?.location?.href,
} as DocumentInterface
