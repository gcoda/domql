import Vue from 'vue'
import App from './App.vue'
import router from './router'
const domServer = () =>
  import(/* webpackChunkName: "domServer" */ './dom-server')
domServer()
  .then(exec => exec?.default)
  .then(exec => {
    Object.assign(window, { domServer: exec })
  })

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
