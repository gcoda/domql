<template>
  <div id="app" class="h-full">
    <editor class="h-full" />
    <div class="hidden">
      <a href="#test" title="I Am Title">Some link</a>
      <a href="/about-page">About</a>
    </div>
  </div>
</template>

<style>
@import './assets/styles/tailwind.postcss';
@import './assets/fonts.css';
body,
html {
  @apply h-full;
}
</style>

<script lang="ts">
/*
import { validateSchema } from 'jsonschema-formatter'
validateSchema(
  {
    name: 'Barack Obama',
    address: {
      lines: ['1600 Pennsylvania Avenue Northwest'],
      zip: 'DC 20500',
      city: 'Washington',
      country: '1',
    },
    votes: 0,
  },
  {
    id: '/SimplePerson',
    type: 'object',
    properties: {
      name: { type: 'string' },
      address: {
        type: 'object',
        properties: {
          lines: {
            type: 'array',
            items: { type: 'string' },
          },
          zip: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
        },
        required: ['country'],
      },
      votes: { type: 'integer', minimum: 1 },
    },
    required: ['name'],
  },
  {}
)
  .then(console.log)
  .catch(console.log)
/* */

/* global globalThis:writable */
import Editor from '@/components/Editor.vue'
import { createComponent, ref } from '@vue/composition-api'
export default createComponent({
  components: { Editor },
  setup() {
    const defaultWidth = 480
    const defaultHeight = 480
    const height = ref(defaultHeight)
    const width = ref(defaultWidth)
    if (globalThis.browser)
      browser?.windows.getCurrent().then(w => {
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
