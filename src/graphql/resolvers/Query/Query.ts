import QueryInterface from './QueryInterface'
import { echo } from '@/graphql/resolvers/common/Echo'

export default {
  echo,
  document: async (
    _,
    { waitForSelector, timeout = 300, bailOnComplete = true },
    { document, waitCheckInterval = 100 }
  ) => {
    if (waitForSelector) {
      let interval: null | NodeJS.Timeout = null
      let counter = 0
      const max = timeout * waitCheckInterval
      await new Promise(resolve => {
        interval = setInterval(() => {
          counter++
          const el = document.querySelector(waitForSelector)
          if (el || counter * waitCheckInterval > max) {
            resolve()
          }
          if (bailOnComplete && document.readyState === 'complete') {
            resolve()
          }
        }, waitCheckInterval)
      })
      if (interval) clearInterval(interval)
    }
    return { __typename: 'Document', document }
  },
} as QueryInterface
