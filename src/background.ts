// new WebSocket...
import PQueue from 'p-queue'
let queue = new PQueue({ concurrency: 1 })

const setConcurrency: SetConcurrency = concurrency => {
  queue.concurrency = concurrency
}

const gql = String.raw

type TabMessage = {
  location?: Maybe<string>
  active?: boolean
  message: DomQlRequestOptions
}
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
      if (!exists)
        await browser.tabs.executeScript(tab.id, {
          file: 'js/content-script.js',
          runAt: 'document_start',
        })
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
      if (!exists)
        await browser.tabs.executeScript(tab.id, {
          file: 'js/content-script.js',
          runAt: 'document_start',
        })
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
const makeRequest: MakeRequest = async request => {
  const tab = await messageTab({ location: request.location, message: request })
  return tab
}

Object.assign(globalThis, { gql, makeRequest, setConcurrency })
import { splitByDocumentField } from './graphql/splitDocuments'

browser.runtime.onMessage.addListener((request: any, sender: any) => {
  const requests = splitByDocumentField(request)
  const results = Promise
    //
    .all(requests.map(r => queue.add(() => makeRequest(r))))
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
        }),
        { data: {}, errors: [] }
      )
    )
    .then(r => (r?.errors?.length ? r : { data: r?.data, errors: null }))
  return results
})

type DomQlRequestOptions = {
  query?: string
  variables?: { [k: string]: any }
  location?: string | null
  backgroundQuery?: boolean
}

type DomQlResponse = {
  data: any
  errors: null | Array<{ message: string }>
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
