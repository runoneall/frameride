import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)

import './global.css'

import naive from 'naive-ui'
app.use(naive)

app.mount('#app')
