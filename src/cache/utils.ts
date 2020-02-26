import crypto from 'crypto'
export const hash = (...args: any) =>
  crypto
    .createHash('sha1')
    .update(JSON.stringify(args))
    .digest('hex')

type Record<K extends keyof any, T> = {
  [P in K]: T
}

type AnyRecord = Record<string, any>

export const sortRecords = <T extends AnyRecord = AnyRecord>(
  args?: T
): NonNullable<T> => {
  return !args
    ? {}
    : Object.fromEntries(
        Object.entries(args)
          .map(([k, v]) => [k.toLowerCase(), v])
          .sort(([a], [b]) => a.localeCompare(b))
      )
}
export const toString = (some?: string | Buffer) => {
  return !some
    ? undefined
    : typeof some === 'string'
    ? some
    : Buffer.isBuffer(some)
    ? some.toString('utf-8')
    : undefined
}
