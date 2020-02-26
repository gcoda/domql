import FsStore from 'datastore-fs'
import { mkdirpSync } from 'fs-extra'
import { Key } from 'interface-datastore'
import * as path from 'path'
import { hash, sortRecords, toString } from './utils'

const cachePath = path.resolve(__dirname, '..', '..', 'cache', 'operations')
mkdirpSync(cachePath)

const cache = new FsStore<string | Buffer>(cachePath)

export type CachedOperation = {
  flow: string
  name: string
  step: string
  args: { [k: string]: any }
  data: { [k: string]: any }
}
export type CachedOperationKey = Omit<CachedOperation, 'data'>

const makeKey = (op: CachedOperationKey) => {
  const h = hash(sortRecords(op.args)).slice(0, 16)
  return new Key(`${op.flow}/${op.step}/${op.name}/${h}`)
}

export default {
  put: (operation: CachedOperation) => {
    cache.put(makeKey(operation), JSON.stringify(operation, null, 2))
  },
  get: async (
    operationMeta: CachedOperationKey
  ): Promise<CachedOperation | undefined> => {
    const key = makeKey(operationMeta)
    const exists = await cache.has(key)
    if (!exists) {
      return undefined
    } else {
      const operationRaw = await cache.get(key)
      const operationContent = toString(operationRaw)
      return operationContent ? JSON.parse(operationContent) : undefined
    }
  },
}
