import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWorkspaceStore = defineStore('workspace', () => {
    const root = ref(null)
    const setroot = path => (root.value = path)
    const init = async () => {
        root.value = await window.api.getWorkspaceRoot()
    }

    return { root, setroot, init }
})
