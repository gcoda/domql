<template>
  <div>
    <div class="query">
      <textarea
        spellcheck="false"
        class="query-area"
        v-model="query"
        x_change="prettify"
      ></textarea>
    </div>
    <div class="button button-exec" @click="execute">Execute</div>
    <div class="response" v-html="response"></div>
  </div>
</template>

<script lang="ts">
import { prettyPrint } from '@/utils/graphql'
import { createComponent, ref } from '@vue/composition-api'
const example = `query allLinks {
  document {
    title
  }
  links: selectAll(selector: "a") {
    href: attr(name: "href")
    text
  }
}`
export default createComponent({
  name: 'Editor',
  props: {},
  setup() {
    const query = ref(example)
    const response = ref('')
    const prettify = () => {
      const { source, error } = prettyPrint(query.value)
      if (!error) {
        query.value = source
      }
    }
    const execute = () => {
      browser.windows.getCurrent().then(currentWindow => {
        browser.tabs
          .query({ active: true, windowId: currentWindow.id })
          .then(tab => {
            try {
              if (tab[0]?.id) {
                prettify()
                browser.tabs
                  .sendMessage(tab[0].id, { query: query.value })
                  .then(result => {
                    console.log(result)
                    response.value = JSON.stringify(result, null, 2)
                  })
              }
            } catch (e) {
              response.value = JSON.stringify(
                { data: null, errors: [e.message] },
                null,
                2
              )
            }
          })
      })
    }
    return { execute, prettify, query, response }
  },
  /*
  mounted() {
    // browser.runtime.sendMessage({ empty: '2' })
  },
  methods: {
    async post() {
      prettyPrint(`query {__typename}`)

      // browser.runtime.sendMessage({ hello: 'from popup' })
      console.log('post')
    },
  },
  computed: {
    defaultText() {
      return browser.i18n.getMessage('extName')
    },
  },
  */
})
</script>

<style>
.button-exec {
  padding: 0.25rem;
  background-color: #ccc;
  opacity: 0.75;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.button-exec:hover {
  opacity: 1;
}
.query-area {
  font-family: monospace;
  flex-grow: 1;
  border: none;
  background-color: #e0ecef;
  margin: 0.5rem 0.5rem 0.5rem 0.5rem;
}
.query {
  display: flex;
  align-items: stretch;
  justify-items: stretch;
  width: 100%;
  height: 48vh;
}
.response {
  height: 48vh;
  font-family: monospace;
  white-space: pre-wrap;
  overflow-y: scroll;
}
</style>
