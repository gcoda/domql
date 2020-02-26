/* global globalThis:writable */
const isWeb = process.env.VUE_APP_SERVE === 'web'

type DomQuery = {
  query: string
  variables?: { [k: string]: any }
}

const domServerModule = () =>
  import(
    /* webpackChunkName: "domServer" */
    /* webpackMode: "eager" */
    '@/graphql/dom-server'
  )
const domServer = !isWeb
  ? false
  : (() => domServerModule().then(exec => exec.default))()

export const sendMessage = ({ query, variables }: DomQuery) => {
  if (isWeb && domServer) {
    return domServer.then(domQl => domQl(query, variables))
  }
  return browser.runtime.sendMessage({ query, variables }).then(response => {
    console.log({ sendMessage: response })
    return response
  })
}
const addHost = (tab: Tab) => {
  if (!tab.url) return tab
  const url = new URL(tab.url)
  return { ...tab, host: url.hostname }
}
export const getAllTabs = async (): Promise<Tab[]> => {
  if (isWeb) {
    const localTab: Tab = {
      url: document.location.href,
      title: document.title,
      active: true,
      id: -1,
    }
    return [localTab].map(addHost)
  } else {
    const tabs = await browser.runtime.sendMessage({ getAllTabs: true })

    return Array.isArray(tabs) ? tabs.map(addHost) : []
  }
}
export type Tab = {
  active: boolean
  id?: number
  index?: number
  lastAccessed?: number
  status?: string
  title?: string
  host?: string
  url?: string
  windowId?: number
  // audible?: boolean
  // cookieStoreId?: string
  // discarded?: boolean
  // favIconUrl?: string
  // height?: number
  // width?: number
  // hidden: boolean
  // highlighted: boolean
  // incognito: boolean
  // isArticle: boolean
  // isInReaderMode: boolean
  // openerTabId?: number
  // pinned: boolean
  // selected: boolean
  // sessionId?: string
}
