// new WebSocket...
import PQueue from 'p-queue'
const queue = new PQueue({ concurrency: 1 })

const setConcurrency: SetConcurrency = concurrency => {
  queue.concurrency = concurrency
}

const gql = String.raw

type TabMessage = {
  location?: Maybe<string>
  active?: boolean
  message: DomQlRequestOptions
}
const executeScript: browser.extensionTypes.InjectDetails = {
  file: 'js/content-script.js',
  runAt: 'document_start',
  matchAboutBlank: true,
}
export type ArgType<F extends Function> = F extends (...args: infer A) => any
  ? A[0]
  : never

const messageTab = async ({
  location,
  active = false,
  message,
}: TabMessage) => {
  if (location) {
    const tab = await browser.tabs.create({
      active,
      url: location,
    })
    if (tab.id) {
      const exists = await browser.tabs
        .sendMessage(tab.id, { checkPresence: true })
        .catch(() => false)
      if (!exists) await browser.tabs.executeScript(tab.id, executeScript)
      const result = await browser.tabs
        .sendMessage(tab.id, message)
        .catch(e => ({ data: null, errors: [{ message: e.message }] }))
      browser.tabs.remove(tab.id)
      return result
    }
  } else {
    const window = await browser.windows.getCurrent()
    const tabs = await browser.tabs.query({ active: true, windowId: window.id })
    const tab = tabs.find(() => true)
    if (tab?.id) {
      const exists = await browser.tabs
        .sendMessage(tab.id, { checkPresence: true })
        .catch(() => false)
      if (!exists) await browser.tabs.executeScript(tab.id, executeScript)
      return browser.tabs
        .sendMessage(tab.id, message)
        .then((result: any) => ({
          ...result,
          data: result?.data,
          tabId: tab?.id,
          windowId: window.id,
        }))
        .catch(e => ({ data: null, errors: [{ message: e.message }] }))
    }
  }
  return { data: null, errors: [{ message: 'Tab not found' }] }
}
const singleRequest: MakeRequest = async request => {
  const tab = await messageTab({ location: request.location, message: request })
  return tab
}

import { splitByDocumentField } from './graphql/splitDocuments'
let requestCounter = 0
const splitRequests = (request: any) => {
  requestCounter++
  const requests = splitByDocumentField(request)
  const response = Promise
    //
    .all(
      requests.map(r =>
        queue.add(() => singleRequest(r), { priority: requestCounter })
      )
    )
    .then(r =>
      r.reduce(
        (a, c) => ({
          data: {
            ...(a?.data ? a.data : undefined),
            ...(c?.data ? c.data : undefined),
          },
          errors: [
            ...(a?.errors ? a?.errors : []),
            ...(c?.errors ? c?.errors : []),
          ],
          outputs: [
            ...(a?.outputs ? a?.outputs : []),
            ...(c?.outputs ? c?.outputs : []),
          ],
        }),
        { data: {}, errors: [], outputs: [] }
      )
    )
    .then(r => ({
      data: r?.data,
      outputs: r?.outputs,
      errors: r?.errors?.length ? r?.errors : null,
    }))
  return response
}

browser.runtime.onMessage.addListener(async (request: any, sender: any) => {
  if (request.query) return splitRequests(request)
  else if (request.getAllTabs) {
    const allTabs = await browser.tabs.query({})
    const currentWindow = await browser.windows.getCurrent()
    return allTabs.map(t => ({
      id: t.id,
      url: t.url,
      active: t.active && currentWindow.id === t.windowId,
      windowId: t.windowId,
      status: t.status,
      title: t.title,
      lastAccessed: t.lastAccessed,
      index: t.index,
    }))
  }
})

Object.assign(globalThis, { gql, makeRequest: splitRequests, setConcurrency })

type DomQlRequestOptions = {
  query?: string
  variables?: { [k: string]: any }
  location?: string | null
  backgroundQuery?: boolean
}

type DomQlResponse = {
  data: any
  errors: null | Array<{ message: string }>
  outputs?: null | Array<any>
  tabId?: number
  windowId?: number
}

export type MakeRequest = (
  options: DomQlRequestOptions
) => Promise<null | DomQlResponse>

type ArgumentType<F extends Function> = F extends (...args: infer A) => any
  ? A[0]
  : never

type Maybe<T> = null | undefined | T
export type SetConcurrency = (concurrency: number) => void
export type QueueOptions = ArgumentType<typeof PQueue>
