import Vue from 'vue'
import Router from 'vue-router'

import MainWindow from '../components/MainWindow.vue'
import Editor from '../components/Editor.vue'
import Settings from '../components/Settings.vue'
import About from '../components/About.vue'
import Print from '../components/Print.vue'
import Import from '../components/Import.vue'
import ThirdPartyLicenses from '../components/About/ThirdPartyLicenses.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-window',
      component: MainWindow
    },
    {
      path: '/editor',
      name: 'editor',
      component: Editor
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/print',
      name: 'print',
      component: Print
    },
    {
      path: '/import',
      name: 'import',
      component: Import
    },
    {
      path: '/third-party-licenses',
      name: 'third-party-licenses',
      component: ThirdPartyLicenses
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
