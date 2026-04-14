<script setup>
import { ref, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'

const workspaceStore = useWorkspaceStore()

const treeData = ref([])
const loading = ref(false)
const loadedKeys = ref(new Set())

const getBaseName = fullPath => {
    const separators = ['/', '\\']
    let lastSeparatorIndex = -1

    for (const sep of separators) {
        const index = fullPath.lastIndexOf(sep)
        if (index > lastSeparatorIndex) {
            lastSeparatorIndex = index
        }
    }

    return lastSeparatorIndex === -1 ? fullPath : fullPath.substring(lastSeparatorIndex + 1)
}

const convertToTreeNodes = items => {
    return items.map(item => ({
        key: item.path,
        label: getBaseName(item.path),
        isLeaf: item.type === 'file',
        children: undefined
    }))
}

const loadDirectory = async (subdir = '') => {
    try {
        const files = await window.api.getWorkspaceFiles(subdir)
        return convertToTreeNodes(files)
    } catch (error) {
        console.error('加载目录失败:', error)
        return []
    }
}

const initTree = async () => {
    if (!workspaceStore.root) return

    loading.value = true
    loadedKeys.value.clear()
    try {
        treeData.value = await loadDirectory('')
    } finally {
        loading.value = false
    }
}

const updateNodeChildren = (nodes, targetKey, children) => {
    for (const node of nodes) {
        if (node.key === targetKey) {
            node.children = children
            return true
        }

        if (node.children && updateNodeChildren(node.children, targetKey, children)) {
            return true
        }
    }

    return false
}

const handleLoad = async node => {
    if (loadedKeys.value.has(node.key)) {
        return node.children || []
    }

    const children = await loadDirectory(node.key)
    loadedKeys.value.add(node.key)

    updateNodeChildren(treeData.value, node.key, children)

    return children
}

watch(
    () => workspaceStore.root,
    newRoot => {
        if (newRoot) initTree()
    }
)

onMounted(() => {
    if (workspaceStore.root) initTree()
})
</script>

<template>
    <div class="explorer-container">
        <div v-if="loading" class="loading-state">
            <n-spin size="small" />
            <span>加载中...</span>
        </div>
        <n-tree v-else-if="treeData.length > 0" :data="treeData" block-line :on-load="handleLoad" class="file-tree" />
        <div v-else class="empty-state">
            <n-empty description="工作区为空" />
        </div>
    </div>
</template>

<style scoped>
.explorer-container {
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    color: #999;
    font-size: 13px;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.file-tree {
    flex: 1;
    min-height: 0;
    font-size: 13px;
    overflow-y: auto;
    overflow-x: auto;
}

.file-tree :deep(.n-tree-node-content) {
    padding: 4px 8px;
    white-space: nowrap;
    min-width: fit-content;
}

.file-tree :deep(.n-tree-node-content:hover) {
    background-color: rgba(255, 255, 255, 0.08);
}

.file-tree :deep(.n-tree-node-switcher) {
    color: #999;
}

.file-tree::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.file-tree::-webkit-scrollbar-track {
    background: transparent;
}

.file-tree::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}

.file-tree::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

.file-tree::-webkit-scrollbar-corner {
    background: transparent;
}
</style>
