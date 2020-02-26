<template>
  <div class="w-full h-full bg-white">
    <div
      class="w-full h-full animate"
      :class="loaded ? 'cm-loaded' : 'cm-loading'"
    >
      <slot></slot>
      <textarea
        class="fixed w-full h-full border-4"
        :class="isDestroyed ? 'cm-destroy' : 'cm-exists'"
        ref="cmArea"
      ></textarea>
    </div>
  </div>
</template>
<style lang="postcss">
.cm-exists {
  @apply opacity-100;
  /* transform: translate(0px, 100px); */
}
.cm-destroy {
  @apply opacity-0;
  transition: opacity 0.1s ease;
  /* transform: translate(0px, 0px); */
}
.cm-loading {
  @apply opacity-0;
  /* transform: translate(0px, 100px); */
}
.cm-loaded {
  @apply opacity-100;
  transition: opacity 0.5s ease;
  /* transform: translate(0px, 0px); */
}
</style>

<script>
import { fetchSchema } from '@/utils/introspection'
import printer from '@/workers/prettierPrint'
import './styles'
const AUTO_COMPLETE_AFTER_KEY = /^[a-zA-Z0-9_@(]$/

const asyncImports = [
  () => import(/* webpackChunkName: "CM" */ 'codemirror/addon/hint/show-hint'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror/addon/lint/lint'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror/addon/comment/comment'),
  () =>
    import(/* webpackChunkName: "CM" */ 'codemirror/addon/edit/matchbrackets'),
  () =>
    import(/* webpackChunkName: "CM" */ 'codemirror/addon/edit/closebrackets'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror/addon/fold/foldgutter'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror/addon/fold/brace-fold'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror/addon/search/search'),
  () =>
    import(/* webpackChunkName: "CM" */ 'codemirror/addon/search/searchcursor'),
  () =>
    import(/* webpackChunkName: "CM" */ 'codemirror/addon/search/jump-to-line'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror/addon/dialog/dialog'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror/keymap/sublime'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror-graphql/hint'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror-graphql/lint'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror-graphql/mode'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror-graphql/jump'),
  // () => import(/* webpackChunkName: "CM" */ 'codemirror-graphql/info'),
  () => import(/* webpackChunkName: "CM" */ 'codemirror/lib/codemirror.js'),
]
let asyncLoaded = false
const readyImports = {}
export default {
  props: {
    value: String,
    isVisible: Boolean,
  },
  data: () => ({
    isDestroyed: false,
    skipChange: false,
    editor: null,
    loaded: false,
    prettyInit: null,
  }),
  name: 'CodeMirror',
  methods: {
    focus() {
      this.editor?.focus?.()
    },

    prettify(newCode, callback) {
      return printer(newCode || this.editor.getValue(), 'graphql', {
        printWidth: this.visibleWidth(),
      }).then(({ error, code }) => {
        this.$emit('input', code)
        if (!error) callback ? callback(code) : this.setValue(code)
      })
    },
    visibleWidth() {
      const gutter = 50 // line nums and scrollbars
      if (!this.editor) return 80
      const charWidth = this.editor.defaultCharWidth()
      const scrollArea = this.editor.getScrollInfo()
      const width = Math.floor((scrollArea.clientWidth - gutter) / charWidth)
      return width
    },
    cmReady(schema) {
      this.loaded = true
      if (!window.CodeMirror) return null
      this.editor = window.CodeMirror.fromTextArea(this.$refs.cmArea, {
        // autofocus: true,
        lineNumbers: true,
        keyMap: 'sublime',
        theme: 'default',
        viewportMargin: Infinity,
        autoCloseBrackets: true,
        styleActiveLine: true,
        matchBrackets: true,
        tabSize: 2,
        showCursorWhenSelecting: true,
        extraKeys: {
          'Ctrl-Enter': () => {
            // console.log('Enter!')
            this.$emit('run', { source: 'editor' })
          },
          'Ctrl-P': cm => {
            const oldCursor = cm?.getCursor?.()
            const line = oldCursor?.line
            const ch = oldCursor?.ch
            this.prettify().then(() => {
              if (line && ch) {
                cm.setCursor(line, ch)
              }
            })
          },
          'Ctrl-Space': () =>
            this.editor.showHint({
              completeSingle: true,
              container: this.$el,
            }),
        },
        lint: {
          schema,
        },
        hintOptions: {
          schema,
          closeOnUnfocus: false,
          completeSingle: false,
          container: this.$el,
        },
        info: {
          schema,
          renderDescription: text => console.info(text),
          onClick: reference => console.warn(reference),
        },
        jump: {
          schema,
          onClick: reference => console.warn(reference),
        },
      })
      this.editor.setSize('100%', '100%')
      this.editor.setValue(this.value || '# query')
      this.editor.on('change', cm => {
        if (this.skipChange) {
          this.skipChange = false
          return
        }
        this.$emit('input', cm.getValue())
      })
      this.editor.on('keyup', this.onKeyUp)
    },

    onKeyUp(cm, event) {
      if (
        AUTO_COMPLETE_AFTER_KEY.test(event.key) &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        this.editor?.execCommand('autocomplete')
      } else {
        // console.log(event)
      }
    },
    setValue(v) {
      var editorValue = this.editor.getValue()
      if (v !== editorValue) {
        console.log('codemirror setValue')
        this.skipChange = true
        const scrollInfo = this.editor.getScrollInfo()
        this.editor.setValue(v)
        this.editor.scrollTo(scrollInfo.left, scrollInfo.top)
      }
    },
  },
  watch: {
    value(newVal) {
      if (this.editor) {
        this.setValue(newVal)
      }
    },
    isVisible() {
      if (this.editor) {
        setTimeout(() => {
          this.editor?.refresh()
        }, 0)
      }
    },
  },
  async mounted() {
    const schema = await fetchSchema().catch(() => null)

    if (!asyncLoaded)
      Promise.all(
        asyncImports.map((fn, i) =>
          fn().then(mod => {
            const module = (mod && mod.default) || mod
            if (asyncImports.length === i + 1) {
              window.CodeMirror = module
            } else {
              readyImports[i] = module
            }
          })
        )
      ).then(() => {
        asyncLoaded = true
        this.cmReady(schema)
      })
    else this.cmReady(schema)
    this.editor?.refresh()
  },
  beforeDestroy() {
    this.loaded = false
    this.isDestroyed = true
    if (this.editor)
      setTimeout(() => {
        this.editor.toTextArea()
        this.editor = null
        // this.editor.toTextArea()
      }, 120)
  },
}
</script>
