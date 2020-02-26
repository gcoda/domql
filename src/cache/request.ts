import FsStore from 'datastore-fs'
import { mkdirpSync } from 'fs-extra'
import { Key } from 'interface-datastore'
import * as path from 'path'
import { RespondOptions } from 'puppeteer-core'
import { hash, sortRecords, toString } from './utils'

const requestCachePath = path.resolve(__dirname, '..', '..', 'cache', 'request')
mkdirpSync(requestCachePath)

const cache = new FsStore<string | Buffer>(requestCachePath)

type CachedRequest = RespondOptions

const makeKey = (url: string) => {
  const u = new URL(url)
  // add '/' after each segment of 8 or more
  const hashedUrl = hash(url)
    .slice(0, 32)
    .replace(/(.{1,8})/g, '$1/')

  return `${u.hostname}${u.pathname}/${hashedUrl}`
}

const storageKeys = (url: string) => {
  const key = makeKey(url)
  return {
    meta: new Key(`${key}meta`),
    body: new Key(`${key}body`),
    status: new Key(`${key}status`),
    headers: new Key(`${key}headers`),
    expires: new Key(`${key}expires`),
  }
}

const parseMaxAge = (
  cacheControl: string | undefined = undefined,
  defaultMaxAge: number = 60,
  minAge: number = 60
) => {
  if (!cacheControl) return defaultMaxAge
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/)
  const maxAge =
    maxAgeMatch && maxAgeMatch.length > 1
      ? parseInt(maxAgeMatch[1], 10)
      : defaultMaxAge
  return Math.max(minAge, maxAge)
}

const stringify = (headers: CachedRequest['headers']) => {
  return !headers ? '{}' : JSON.stringify(headers, null, 2)
}
export default {
  parseMaxAge,
  put: (url: string, { body, status, headers }: CachedRequest) => {
    // do nothing if not OK
    if (status && (status > 300 || status < 200)) {
      return Promise.resolve()
    }
    const sortedHeaders = sortRecords(headers)
    const maxAge = parseMaxAge(sortedHeaders['cache-control'])
    const ttl = Date.now() + maxAge * 1000
    if (url.startsWith('http')) {
      const keys = storageKeys(url)
      return Promise.all([
        cache.put(keys.meta, JSON.stringify({ url }, null, 2)),
        body ? cache.put(keys.body, body) : null,
        status ? cache.put(keys.status, `${status}`) : null,
        headers ? cache.put(keys.headers, stringify(sortedHeaders)) : null,
        ttl ? cache.put(keys.expires, `${ttl}`) : null,
      ])
    }
  },
  expires: async (url: string): Promise<false | number> => {
    const keys = storageKeys(url)

    const exists = await cache.has(keys.expires)

    if (!exists) return false

    const expiresValue = await cache.get(keys.expires) //
    const expires = toString(expiresValue)

    return typeof expires === 'string' ? 10000 : false
  },
  get: async (url: string): Promise<CachedRequest | undefined> => {
    const keys = storageKeys(url)
    const exists = await cache.has(keys.body)
    if (!exists) {
      return undefined
    } else {
      const expires = '10000' // await cache.get(keys.expires)
      const body = await cache.get(keys.body)
      const headersValue = await cache.get(keys.headers)
      const headers = toString(headersValue)
      const statusValue = await cache.get(keys.status)
      const status = toString(statusValue)
      return {
        ...(typeof expires === 'string'
          ? { expires: parseInt(expires) }
          : { expires: Date.now() + 10000 }),
        ...(typeof status === 'string' ? { status: parseInt(status) } : null),
        ...(typeof headers === 'string'
          ? { headers: JSON.parse(headers) }
          : null),
        body,
      }
    }
  },
}
