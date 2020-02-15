<template>
  <editor />
</template>

<script lang="ts">
import Vue from 'vue'
import Editor from '@/components/Editor.vue'

export default Vue.extend({
  name: 'App',
  components: { Editor },
})
</script>

<style>
html,
body {
  width: 480px;
  height: 480px;
  margin: 0;
  padding: 0;
}
</style>
