const listener: RequestListener = details => {
  if (details.type !== 'xmlhttprequest') {
    return {}
  }

  return {}
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  { urls: ['*://*/*'], types: ['xmlhttprequest'] },
  ['blocking']
)
browser.webRequest.onResponseStarted.addListener(listener, {
  urls: ['*://*/*'],
  types: ['xmlhttprequest'],
})
browser.webRequest.onCompleted.addListener(listener, {
  urls: ['*://*/*'],
  types: ['xmlhttprequest'],
})

type HttpHeaders = (
  | { name: string; binaryValue: number[]; value?: string }
  | { name: string; value: string; binaryValue?: number[] }
)[]

type ArgumentType<F extends Function> = F extends (...args: infer A) => any
  ? A[0]
  : never

type RequestListener = ArgumentType<
  typeof browser.webRequest.onBeforeRequest.addListener
>
type BlockingResponse = {
  cancel?: boolean
  redirectUrl?: string
  requestHeaders?: HttpHeaders
  responseHeaders?: HttpHeaders
  authCredentials?: { username: string; password: string }
}
