<script setup>
import { ref, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'

const workspaceStore = useWorkspaceStore()

// 树形数据
const treeData = ref([])
// 加载中状态
const loading = ref(false)
// 记录已加载的目录
const loadedKeys = ref(new Set())

// 提取文件名或目录名（跨平台兼容）
const getBaseName = fullPath => {
    // 同时处理 Windows (\) 和 Unix (/) 路径分隔符
    const lastSlashIndex = Math.max(fullPath.lastIndexOf('/'), fullPath.lastIndexOf('\\'))
    return lastSlashIndex === -1 ? fullPath : fullPath.substring(lastSlashIndex + 1)
}

// 将文件列表转换为树节点格式
const convertToTreeNodes = items => {
    return items.map(item => ({
        key: item.path,
        label: getBaseName(item.path),
        isLeaf: item.type === 'file',
        // 目录节点初始为 undefined，触发懒加载
        children: undefined,
        // 存储原始数据
        _raw: item
    }))
}

// 加载指定目录的文件
const loadDirectory = async (subdir = '') => {
    try {
        console.log('加载目录:', subdir)
        const files = await window.api.getWorkspaceFiles(subdir)
        console.log('获取到文件:', files)
        return convertToTreeNodes(files)
    } catch (error) {
        console.error('加载目录失败:', error)
        return []
    }
}

// 初始化加载根目录
const initTree = async () => {
    if (!workspaceStore.root) {
        return
    }

    loading.value = true
    loadedKeys.value.clear()
    try {
        treeData.value = await loadDirectory('')
    } finally {
        loading.value = false
    }
}

// 查找并更新节点的 children
const findAndUpdateNode = (nodes, targetKey, children) => {
    for (const node of nodes) {
        if (node.key === targetKey) {
            node.children = children
            return true
        }
        if (node.children && Array.isArray(node.children)) {
            if (findAndUpdateNode(node.children, targetKey, children)) {
                return true
            }
        }
    }
    return false
}

// 懒加载函数 - n-tree 的 onLoad 回调
const handleLoad = async node => {
    // 避免重复加载
    if (loadedKeys.value.has(node.key)) {
        return node.children || []
    }

    // 只处理目录节点
    if (node._raw?.type !== 'directory') {
        loadedKeys.value.add(node.key)
        return []
    }

    const subdir = node._raw.path
    const children = await loadDirectory(subdir)

    // 标记为已加载
    loadedKeys.value.add(node.key)

    // 关键：手动更新树数据中的节点
    findAndUpdateNode(treeData.value, node.key, children)

    return children
}

// 监听 root 变化
watch(
    () => workspaceStore.root,
    newRoot => {
        if (newRoot) {
            initTree()
        }
    }
)

// 组件挂载时初始化
onMounted(() => {
    if (workspaceStore.root) {
        initTree()
    }
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

/* 防止树节点内容折行 */
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

/* 美化滚动条样式（Webkit浏览器） */
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
</style>
