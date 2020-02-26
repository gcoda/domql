import AnyProxy, {
  RuleModule,
  ProxyOptions,
  BeforeSendRequestResult,
} from 'anyproxy'
type ProxyInit = {
  port: number
  proxyServer: string
}
import requestCache from '../cache/request'
const cache: RuleModule = {
  beforeSendRequest: async (
    requestDetail
  ): Promise<BeforeSendRequestResult | null> => {
    if (requestDetail.url.match(/chater|czater|google|facebook|trc\.tab/)) {
      return {
        response: {
          body: '',
          header: { 'content-type': 'text/plain' },
          statusCode: 404,
        },
      }
    }
    const method = requestDetail._req.method
    if (method && ['GET', 'HEAD'].includes(method)) {
      const expires = await requestCache.expires(requestDetail.url)
      if (expires /* > Date.now? */) {
        const cached = await requestCache.get(requestDetail.url)
        if (cached?.headers) {
          return {
            response: {
              body: cached.body,
              header: cached.headers,
              statusCode: cached.status,
            },
          } as BeforeSendRequestResult
        }
      }
    }
    console.log({ [method || 'R']: `${requestDetail.url}`.slice(0, 48) })
    return null
  },
  beforeSendResponse: async (requestDetail, responseDetail) => {
    const response = responseDetail.response
    const method = requestDetail._req.method
    if (method && ['GET', 'HEAD'].includes(method)) {
      await requestCache.put(requestDetail.url, {
        body: response.body,
        headers: response.header,
        status: response.statusCode,
      })
    }
    return null
  },
}
export const startProxy = (
  options: Partial<ProxyOptions>
): Promise<ProxyInit> => {
  const o: ProxyOptions = {
    port: 8005,
    rule: cache,
    webInterface: {
      enable: true,
      webPort: 8002,
    },
    hostname: 'localhost',
    // throttle: 10000,
    forceProxyHttps: true,
    type: 'https',
    dangerouslyIgnoreUnauthorized: true,
    wsIntercept: false,
    silent: true,
    ...options,
  }
  const proxyServer = new AnyProxy.ProxyServer(o)
  // proxyServer.on('error', e => {})
  return new Promise(resolve => {
    proxyServer.on('ready', () => {
      resolve({
        port: parseInt(`${o.port}`),
        proxyServer: `${o.type || 'http'}://localhost:${o.port}`,
      })
    })
    proxyServer.start()
  })
}
