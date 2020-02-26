<template>
  <div class="v-query-list">
    <div @click="saveQueries">
      saveAll 🔗
    </div>
    <!-- 
    <div v-if="activeQuery">
      {{ activeQuery.key }}
    </div>
    <div>
      {{ stored }}
    </div> -->
    <template v-for="(tab, tabNumber) of allTabs">
      <div v-if="tabNumber < 3" :key="tab.id">{{ tab.title }}</div>
    </template>
    <div class="grid grid-cols-2 gap-2">
      <template v-for="query of queries">
        <div
          class="flex col-start-1 col-query-item col-query-item__name"
          :key="query.key + query.name"
          @click="selectQueryByKey(query.key)"
        >
          <div class="mr-2 text-3xl text-teal-100 bg-teal-500 emoji-icon">
            ✏
          </div>
          <div class="mr-2 text-2xl text-orange-200 bg-orange-500 emoji-icon">
            ✖
          </div>
          {{ query.name }}
        </div>
        <div
          class=" col-query-item"
          :key="query.key + query.name + 'host'"
          @click="selectQueryByKey(query.key)"
        >
          <div
            class="mr-2 text-teal-100 bg-teal-500 shadow-elevation-12 emoji-icon"
          >
            🌐
          </div>
          {{ query.host }}
        </div>
      </template>
    </div>
  </div>
</template>
<style lang="postcss">
.emoji-icon {
  @apply cursor-pointer select-none;
  @apply flex items-center justify-center w-8 h-8 rounded-full;
  /* leading-none */
  line-height: 0;
}
.col-query-item {
  @apply flex items-center;
  @apply bg-blue-100 p-1 rounded-lg;
  & .col-query-item__name {
    /*  */
  }
}
</style>
<script lang="ts">
import { createComponent, onMounted } from '@vue/composition-api'
import { useQueryStore } from '@/store'
type StoredQuery = {
  name: string
  key: string
}
export default createComponent({
  name: 'VQueryList',
  props: {
    queryName: {
      type: String,
    },
    query: {
      type: String,
    },
  },
  setup(props, { emit }) {
    //
    const {
      allQueries,
      getAllTabs,
      addQuery,
      activeQuery,
      saveQueries,
      allTabs,
      selectQuery,
    } = useQueryStore()

    const queries = allQueries
    onMounted(() => {
      getAllTabs()
    })
    const createNewQuery = () => {
      addQuery({
        name: document.location.hostname,
      })
    }
    const selectQueryByKey = (key: string) => {
      emit('select', key)
      selectQuery(key)
    }
    // const tabs = computed(()=> allTabs.value.slice(0,2))
    return {
      queries,
      stored: allQueries,
      allTabs,
      activeQuery: activeQuery,
      createNewQuery,
      saveQueries: () => saveQueries(),
      selectQueryByKey,
    }
  },
})
</script>
