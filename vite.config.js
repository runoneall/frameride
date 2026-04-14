import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue(),
        electron({
            main: {
                entry: 'electron/main.mjs'
            },
            preload: {
                input: path.join(__dirname, 'electron/preload.mjs')
            },
            renderer: process.env.NODE_ENV === 'test' ? undefined : {}
        })
    ],
    optimizeDeps: {
        exclude: ['monaco-editor']
    },
    build: {
        target: 'es2022',
        rollupOptions: {
            output: {
                manualChunks: id => {
                    if (id.includes('monaco-editor')) {
                        return 'monaco-editor'
                    }
                }
            }
        }
    }
})
