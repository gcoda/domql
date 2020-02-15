<template>
  <div>
    <div class="query">
      <textarea
        spellcheck="false"
        class="query-area"
        v-model="query"
        @change="autoSave"
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
import { sendMessage } from './dispatchMessage'
export default createComponent({
  name: 'Editor',
  props: {},
  setup() {
    const stored = localStorage.getItem('stored-query')
    const query = ref(
      typeof stored === 'string' && stored.length > 0 ? stored : example
    )
    const response = ref('')

    const autoSave = () => {
      const { source, errors } = prettyPrint(query.value)
      if (!errors) localStorage.setItem('stored-query', source)
      return { source, errors }
    }

    const execute = () => {
      const { source, errors } = autoSave()
      if (!errors) {
        query.value = source
        sendMessage({
          query: source,
          variables: {
            // google: 'https://google.com',
          },
        }).then(result => (response.value = JSON.stringify(result, null, 2)))
      } else {
        response.value = JSON.stringify({ data: null, errors }, null, 2)
      }
    }
    return { execute, autoSave, query, response }
  },
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
