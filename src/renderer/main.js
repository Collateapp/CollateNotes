import Vue from 'vue'
import axios from 'axios'

import store from './store'
import router from './router'
import App from './App.vue'

import './lib/contextMenus.js'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.config.debug = true

/* eslint-disable no-new */
window.collate.vue = new Vue({
  components: { App },
  store,
  router,
  template: '<App/>'
}).$mount('#app')
