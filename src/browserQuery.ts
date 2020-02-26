import { Target, launch, Page, RespondOptions } from 'puppeteer-core'
import * as path from 'path'
const gql = String.raw
// import { PuppeteerBlocker } from '@cliqz/adblocker-puppeteer'
// import fetch from 'cross-fetch' // required 'fetch'

const extensionPath = path.resolve(__dirname, '../dist')
const extensionName = 'DomQl'
import { MakeRequest, SetConcurrency } from './background'
const setConcurrency: SetConcurrency = () => undefined
const makeRequest: MakeRequest = () => Promise.resolve(null)
type DomQuery = { query: string; variables: { [k: string]: any } }

const pageLogger = (page?: null | Page) => {
  if (page) {
    page
      .on('console', message =>
        console.log(
          `${message
            .type()
            .substr(0, 3)
            .toUpperCase()} ${message.text()}`
        )
      )
      .on('pageerror', ({ message }) => console.log(message))
      .on('response', response =>
        console.log(`${response.status()} ${response.url()}`)
      )
      .on('requestfailed', request => console.log(`FAILED ${request.url()}`))
  }
}
export type BrowserQueryOptions = {
  concurrency?: number
  blockResourceTypes?: string[]
  proxyServer?: string
  ignoreHTTPSErrors?: boolean
}
import requestCache from './cache/request'

const findBackgroundPage = async (targets: Target[]): Promise<Page> => {
  const extensionTarget = targets.find(
    ({ _targetInfo }: any) =>
      `${_targetInfo.title}`.toLowerCase() ===
        `${extensionName}`.toLowerCase() &&
      _targetInfo.type === 'background_page'
  )
  const page = await extensionTarget?.page()
  if (!page) throw new Error('Background Page Not Found')
  return page
}
export const browserQuery = async ({
  concurrency = 3,
  blockResourceTypes = ['image'],
  proxyServer,
  ignoreHTTPSErrors = false,
}: BrowserQueryOptions = {}) => {
  const browser = await launch({
    ignoreHTTPSErrors,
    headless: false, // extension are allowed only in the head-full mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      `--no-sandbox`,
      ...(ignoreHTTPSErrors ? ['--ignore-certificate-errors'] : []),
      ...(proxyServer ? [`--proxy-server=${proxyServer}`] : []),
    ],
    executablePath: '/usr/bin/google-chrome',
  })

  await browser.newPage() // const dummy
  const targets = await browser.targets()
  const page = await findBackgroundPage(targets)
  if (!page) throw new Error('Background Page Not Found')
  await page.setRequestInterception(true)

  browser.on('targetcreated', async target => {
    const type = target.type()
    const targetUrl = target.url()
    if (type === 'page') {
      const page = await target.page()

      await page.setRequestInterception(true)

      page.on('request', async request => {
        const url = request.url()

        const type = request.resourceType()
        if (blockResourceTypes.includes(type)) {
          request.abort()
        } else {
          const cachedResponse = await requestCache.get(url)
          if (cachedResponse) {
            await request.respond(cachedResponse)
            return
          } else {
            // blocker.onRequest(request)
            //
          }
          request.continue()
        }
      })

      page.on('response', async response => {
        const url = response.url()
        let buffer
        try {
          buffer = await response.buffer()
        } catch (error) {
          // some responses do not contain buffer and do not need to be cached
          return
        }
        await requestCache.put(url, {
          status: response.status(),
          headers: response.headers(),
          body: buffer,
        })
      })
    }
  })

  await page.evaluate(
    concurrency =>
      setConcurrency
        ? setConcurrency(concurrency)
        : { data: null, errors: [{ message: 'Extension not initialized' }] },
    concurrency
  )
  const domQl = (domQuery: DomQuery) => {
    try {
      return page
        .evaluate(domQuery => {
          return makeRequest
            ? makeRequest(domQuery)
            : {
                data: null,
                errors: [{ message: 'Extension not initialized' }],
              }
        }, domQuery)
        .catch(e => ({ data: null, errors: [{ message: e.message }] }))
    } catch (e) {
      return Promise.resolve({ errors: [{ message: e.message }] })
    }
  }
  return {
    domQl,
    close: () => browser.close(),
  }
}
