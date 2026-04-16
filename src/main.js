import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)

import naive from 'naive-ui'
app.use(naive)

import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)

import { useWorkspaceStore } from './stores/workspace'
const workspace = useWorkspaceStore()
workspace.init()

import './global.css'
app.mount('#app')
