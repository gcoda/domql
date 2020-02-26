<template>
  <div id="app" class="h-full">
    <editor class="h-full" />
  </div>
</template>

<script lang="ts">
import Editor from '@/components/Editor.vue'
import { createComponent, ref } from '@vue/composition-api'

export default createComponent({
  components: { Editor },
  setup() {
    const defaultWidth = 480
    const defaultHeight = 480
    const height = ref(defaultHeight)
    const width = ref(defaultWidth)
    browser.windows.getCurrent().then(w => {
      if (w.width && w.height) {
        const halfWidth = w.width / 2

        width.value =
          halfWidth < defaultWidth
            ? defaultWidth
            : halfWidth > 720
            ? 720
            : halfWidth

        height.value = w.height / 2
        document
          .querySelector('html')
          ?.style.setProperty('--width', `${width.value}`)
        document
          .querySelector('html')
          ?.style.setProperty('--height', `${height.value}`)
      }
    })
    return { width, height }
  },
})
</script>

<style>
@import '../assets/styles/tailwind.postcss';
@import '../assets/fonts.css';
html,
body {
  /* width: calc(var(--width, 480) * 1px);
  height: calc(var(--height, 480) * 1px); */
  width: 480px;
  height: 480px;
  margin: 0;
  padding: 0;
}
</style>
