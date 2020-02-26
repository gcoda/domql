<template>
  <div class="pt-12 v-editor">
    <div class="fixed top-0 z-20 w-full h-12 tabs">
      <div
        :class="{ active: activeTab === 'query-list' }"
        class="button query-list"
        @click="activeTab = 'query-list'"
      >
        Queries
      </div>
      <div
        :class="{ active: activeTab === 'query-edit' }"
        class="button query-edit"
        @click="activeTab = 'query-edit'"
      >
        Edit
      </div>
      <div
        class="w-10 h-10 button query-execute"
        @click="execute"
        :class="{ loading: queryLoading }"
      >
        <v-icon name="play"></v-icon>
      </div>
      <div
        :class="{ active: activeTab === 'query-result' }"
        class="button query-result"
        @click="activeTab = 'query-result'"
      >
        Result
      </div>
    </div>
    <VQueryList
      :key="'view-query-list'"
      :query="queryString"
      v-show="activeTab === 'query-list'"
    ></VQueryList>
    <code-mirror
      ref="cmContainer"
      :key="'view-query-edit'"
      :class="{ 'hide-query-edit': activeTab !== 'query-edit' }"
      v-show="activeTab === 'query-edit'"
      :value="queryString"
      :is-visible="activeTab === 'query-edit'"
      @input="updateQueryString"
      @run="execute"
    ></code-mirror>
    <pre
      :key="'view-query-result'"
      tabIndex="1"
      v-show="activeTab === 'query-result'"
      class="result-json result line-numbers"
      data-plugin-header="line-numbers"
      v-html="responseHtml"
    ></pre>
  </div>
</template>

<style lang="postcss">
.v-editor {
  & > .hide-query-edit {
    /* @apply pointer-events-none; */
    z-index: -1000;
  }
  & .result {
    @apply h-full overflow-auto outline-none text-base;

    font-family: 'PT Mono';
    font-weight: 400 !important;
    white-space: pre-wrap;
    /*  */
  }
  & .tabs {
    @apply flex items-center px-2 justify-center;
    @apply bg-gray-400 shadow-md;
    & .button {
      @apply px-2 py-1 rounded-lg shadow-md font-bold;
      @apply bg-teal-200 font-sans opacity-75;
      @apply cursor-pointer transition-all duration-200;

      -webkit-tap-highlight-color: transparent;

      &:focus {
        @apply select-none outline-none;
      }
      &:active {
        @apply select-none outline-none;
      }

      &:hover {
        @apply opacity-100;
      }
      &.active {
        @apply bg-green-400;
      }
      &.query-execute {
        @apply p-1 flex items-center rounded-full bg-teal-700;
        &.loading {
          @apply opacity-25 cursor-default pointer-events-none;
        }
        & .v-icon {
          @apply w-full h-full ml-1 text-blue-100;
        }
      }
      @apply mr-2;
      &:last-of-type {
        @apply mr-0;
      }
    }
  }
}
</style>

<script lang="ts">
const CodeMirror = () =>
  import(/* webpackChunkName: "CM" */ '@/components/CodeMirror')

import VIcon from '@/components/Icon'
import VQueryList from '@/components/QueryList'
import { prettyPrint } from '@/utils/graphql'
import {
  createComponent,
  ref,
  onBeforeMount,
  onBeforeUnmount,
  computed,
} from '@vue/composition-api'

// const example = `query allLinks {
//   document(location: "https://news.ycombinator.com") {
//     title
//     links: selectAll(selector: "a") {
//       href: attr(name: "href")
//       text
//     }
//   }
// }
// `
type EditorTab =
  | 'query-edit'
  | 'query-list'
  | 'query-result'
  | 'query-variables'

const formatResult = (
  errors: any = null,
  data: any = null,
  outputs: any = null
) => JSON.stringify({ data, errors, outputs }, null, 2)

type Delay<T = any> = (ms: number) => (r: T) => Promise<T>

const delay: Delay = ms => r =>
  new Promise(resolve => setTimeout(() => resolve(r), ms))

import { sendMessage, getAllTabs } from './dispatchMessage'

import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-json'

const highlight = (json: string) =>
  Prism.highlight(json, Prism.languages.json, 'json')
import { useQueryStore } from '@/store'

export default createComponent({
  components: { CodeMirror, VIcon, VQueryList },
  name: 'Editor',
  props: {},
  setup() {
    const { updateActiveQuery, activeQuery } = useQueryStore()
    const activeTab = ref<EditorTab>('query-edit')
    // const stored = localStorage.getItem('stored-query')
    const query = activeQuery
    const queryString = computed(() => query.value?.query || '')
    const cmContainer = ref<Vue | null>(null)
    const queryLoading = ref(false)
    const response = ref('')
    const responseHtml = ref('')

    const updateResponse = (...args: any[]) => {
      const jsonString = formatResult(...args)
      response.value = jsonString
      responseHtml.value = highlight(jsonString)
    }

    const updateQueryString = (queryString: string) => {
      updateActiveQuery({ query: queryString })
    }
    const autoSave = () => {
      if (query.value) {
        const { errors } = prettyPrint(query.value.query)
        if (!errors) {
          updateActiveQuery(query.value)
          // localStorage.setItem('stored-query', query.value)
        }
        return { source: query.value.query, errors }
      } else {
        return {}
      }
    }

    const execute = () => {
      const { source, errors } = autoSave()
      if (!errors && source) {
        queryLoading.value = true
        // query.value = source
        sendMessage({
          query: source,
          variables: {
            google: 'https://google.com',
            // min: 10,
          },
        })
          .then(delay(200))
          .then(r => {
            console.log({ r })
            updateResponse(r?.errors, r?.data, r?.outputs)
          })
          .catch(e => {
            updateResponse([{ message: e.message }])
          })
          .then(() => {
            activeTab.value = 'query-result'
            queryLoading.value = false
          })
      } else {
        updateResponse(errors)
      }
    }
    const listTabs = async () => {
      const tabs = await getAllTabs()
      const activeTabInfo = tabs.find(({ active }) => active)
      if (activeTabInfo?.id) {
        console.log(tabs)
      }
    }

    const cycleTabs = (e: KeyboardEvent) => {
      if (
        activeTab.value === 'query-result' &&
        e.ctrlKey === true &&
        e.key === 'Enter'
      ) {
        activeTab.value = 'query-edit'
        const cm = cmContainer.value as any
        if (typeof cm?.focus === 'function') {
          setTimeout(cm.focus, 0)
        }
        e.stopPropagation()
      }
    }
    onBeforeMount(() => window.addEventListener('keydown', cycleTabs))
    onBeforeUnmount(() => window.removeEventListener('keydown', cycleTabs))

    return {
      updateQueryString,
      execute,
      autoSave,
      query,
      queryString,
      response,
      responseHtml,
      listTabs,
      activeTab,
      queryLoading,
      cycleTabs,
      cmContainer,
    }
  },
})
</script>
