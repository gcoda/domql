import Vue from 'vue'
import App from './App.vue'
import VueCompositionApi from '@vue/composition-api'

Vue.use(VueCompositionApi)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})
