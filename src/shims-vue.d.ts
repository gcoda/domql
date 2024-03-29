declare module '*.vue' {
  import 'web-ext-types'
  import Vue from 'vue'
  export default Vue
}

declare module '*.gql' {
  import { DocumentNode } from 'graphql'
  const content: DocumentNode
  export default content
}
