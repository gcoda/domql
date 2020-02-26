import { createStore } from 'pinia'
import { getAllTabs, Tab } from '@/components/dispatchMessage'
type StoredQuery = {
  key: string
  query: string
  name?: string
  host?: string
  variables?: { [k: string]: any }
}
const gql = String.raw
const HNExample = gql`
  fragment ValueNumber on Node {
    value: text
      # @replace(search: "\\D", flags: "g")
      @number(toFixed: 2)
  }
  query clickUpVote {
    document(
      waitForSelector: "body"
      location: "https://news.ycombinator.com"
    ) {
      title
      articles: selectAll(selector: "tr.athing", hasText: "Show HN") {
        select(s: ".votearrow") {
          parent {
            click(waitForSelector: ".nosee", wait: 0.2) {
              ok: echo(boolean: true)
            }
          }
        }
        link: select(selector: "a.storylink")
          @output(name: "asd", includeResult: true) {
          href: attr(name: "href")
          text
        }
        info: next {
          text @trim
          score: select(selector: ".score") {
            ...ValueNumber
          }
          comments: select(selector: "a:last-of-type") {
            ...ValueNumber
          }
        }
      }
    }
  }
`
const loadQueries = (): StoredQuery[] => {
  const savedRaw = localStorage.getItem('stored-queries')
  if (savedRaw) {
    try {
      const parsed = JSON.parse(savedRaw)
      return parsed
    } catch (e) {
      //
    }
  }
  return [
    {
      key: 'default',
      name: 'HackerNews',
      query: HNExample,
    },
  ]
  //
}
import { debounce } from 'throttle-debounce'
const saveQueriesNow = (queries: any[]) => {
  console.log('localStorage set')
  localStorage.setItem('stored-queries', JSON.stringify(queries))
}
const saveQueries = debounce(500, saveQueriesNow)
export const useQueryStore = createStore({
  // name of the store
  id: 'QueryStore',
  state: () => ({
    counter: 0,
    activeQueryKey: 'default',
    tabs: [] as Tab[],
    queries: loadQueries(),
  }),
  getters: {
    allTabs: (state): Tab[] =>
      state.tabs
        .sort((a, b) => (a.active ? -1 : b.index || 0))
        .slice(0, 10)
        .map(tab => ({
          ...tab,
          key: `${tab.id}${tab.index}${tab.windowId}${tab.url}`
            //
            .replace(/\W/g, ''),
        })),

    activeQuery(state) {
      return state.queries.find(q => q.key === state.activeQueryKey)
    },
    allQueries: (state, { allTabs }): StoredQuery[] => {
      if (Array.isArray(allTabs.value)) {
        return state.queries.sort((a, b) => {
          const left = allTabs.value.findIndex(
            (tab: Tab) => a.host === tab.host
          )
          const right = allTabs.value.findIndex(
            (tab: Tab) => b.host === tab.host
          )
          return right - left
        })
      } else {
        return []
      }
    },
  },
  actions: {
    async getAllTabs() {
      const tabs = await getAllTabs()
      if (Array.isArray(tabs)) this.state.tabs = tabs
      return
    },
    selectQuery(key: string) {
      if (this.state.queries.find(q => q.key === key)) {
        this.state.activeQueryKey = key
        // console.log({ selected: key })
      }
    },

    addQuery(query: Partial<StoredQuery>) {
      this.state.queries.push({
        query: 'query new { __typename }',
        ...query,
        key: Math.random().toString(36),
      })
      saveQueries(this.state.queries)
    },

    updateActiveQuery(patch: Partial<StoredQuery>) {
      const activeKey = this.state.activeQueryKey
      this.state.queries = this.state.queries.map(query => {
        if (activeKey === query.key) {
          return {
            ...query,
            ...patch,
          }
        }
        return query
      })
      saveQueries(this.state.queries)
    },

    saveQueries() {
      const queries = this.state.queries
      saveQueriesNow(queries)
    },
  },
})
