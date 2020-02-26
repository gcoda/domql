import operationCache, {
  CachedOperation,
  CachedOperationKey,
} from './cache/operation'

export const cache = {
  ready: false as boolean,
  data: null as null | CacheData | CacheData[],
  async get(key: CachedOperationKey): Promise<CachedOperation | undefined> {
    return operationCache.get(key)
  },
  async put(operation: CachedOperation) {
    return operationCache.put(operation)
  },
}

type CacheData = { [k: string]: any }
