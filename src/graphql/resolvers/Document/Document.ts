import { select, selectAll } from '@/graphql/resolvers/common/SelectResolver'
import { echo } from '@/graphql/resolvers/common/Echo'
import DocumentInterface from './DocumentInterface'
export default {
  echo,
  title: root => root?.document?.title,
  select,
  selectAll,
  referrer: root => root?.document?.referrer,
  location: root => root?.document?.location?.href,
} as DocumentInterface
