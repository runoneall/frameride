<script setup>
import { ref, onMounted, onUnmounted, watch, h } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'
import { useDialog } from 'naive-ui'

import NewFileIcon from '../icons/NewFileIcon.vue'
import NewFolderIcon from '../icons/NewFolderIcon.vue'
import RefreshIcon from '../icons/RefreshIcon.vue'
import CollapseIcon from '../icons/CollapseIcon.vue'

const workspaceStore = useWorkspaceStore()
const dialog = useDialog()

const treeData = ref([])
const loading = ref(false)
const loadedKeys = ref(new Set())
const expandedKeys = ref([])
const selectedKeys = ref([])
const showDropdown = ref(false)
const dropdownPosition = ref({ x: 0, y: 0 })
const currentNode = ref(null)

const getBaseName = path => path.split(/[\\/]/).pop()
const convertToTreeNodes = items =>
    items.map(item => ({
        key: item.path,
        label: getBaseName(item.path),
        isLeaf: item.type === 'file',
        children: undefined,
        _raw: item
    }))

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

    try {
        resetTreeState()
        treeData.value = await loadDirectory()
    } finally {
        loading.value = false
    }
}

const resetTreeState = () => {
    loadedKeys.value.clear()
    expandedKeys.value = []
    selectedKeys.value = []
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
    if (loadedKeys.value.has(node.key)) return node.children || []
    const children = await loadDirectory(node.key)
    loadedKeys.value.add(node.key)
    updateNodeChildren(treeData.value, node.key, children)
    return children
}

const findNodeByKey = (nodes, key) => {
    for (const node of nodes) {
        if (node.key === key) return node
        if (node.children) {
            const found = findNodeByKey(node.children, key)
            if (found) return found
        }
    }

    return null
}

const getTargetSubdir = () => {
    if (selectedKeys.value.length > 0) {
        const node = findNodeByKey(treeData.value, selectedKeys.value[0])
        if (node && !node.isLeaf) return node.key
        if (node) return node.key.replace(/\\/g, '/').split('/').slice(0, -1).join('/')
    }

    return expandedKeys.value[0] || ''
}

const showInputDialog = (title, placeholder) => {
    const inputValue = ref('')
    return new Promise(resolve => {
        dialog.info({
            title,
            content: () =>
                h('div', [
                    h('p', { style: 'margin-bottom: 12px;' }, `请输入${title.includes('文件') ? '文件名（包含扩展名）' : '文件夹名称'}`),
                    h('input', {
                        class: 'dialog-input',
                        value: inputValue.value,
                        onInput: e => (inputValue.value = e.target.value),
                        style: 'width: 100%; padding: 6px 10px; border: 1px solid #505050; border-radius: 4px; background: #1e1e1e; color: #fff; box-sizing: border-box;',
                        placeholder
                    })
                ]),
            positiveText: '创建',
            negativeText: '取消',
            onPositiveClick: () => resolve(inputValue.value.trim()),
            onNegativeClick: () => resolve(''),
            onClose: () => resolve('')
        })

        setTimeout(() => document.querySelector('.dialog-input')?.focus(), 100)
    })
}

const createItem = async type => {
    const targetDir = getTargetSubdir()
    const name = await showInputDialog(type === 'file' ? '新建文件' : '新建文件夹', type === 'file' ? '例如: index.js' : '例如: src')
    if (!name) return

    try {
        const fullPath = targetDir ? `${targetDir}/${name}` : name
        await (type === 'file' ? window.api.createFile(fullPath) : window.api.createDir(fullPath))

        dialog.success({
            title: '成功',
            content: `${type === 'file' ? '文件' : '文件夹'} "${name}" 创建成功`,
            positiveText: '确定'
        })

        await refreshCurrentDirectory(targetDir)
    } catch (error) {
        dialog.error({
            title: '错误',
            content: `创建失败: ${error.message}`,
            positiveText: '确定'
        })
    }
}

const refreshCurrentDirectory = async (subdir = '') => {
    loading.value = true
    try {
        if (!subdir) {
            treeData.value = await loadDirectory()
            loadedKeys.value.clear()
        } else {
            const children = await loadDirectory(subdir)
            loadedKeys.value.add(subdir)
            updateNodeChildren(treeData.value, subdir, children)
        }
    } finally {
        loading.value = false
    }
}

const handleContextMenu = (e, node) => {
    e.preventDefault()
    selectedKeys.value = [node.key]
    currentNode.value = node
    dropdownPosition.value = { x: e.clientX, y: e.clientY }
    showDropdown.value = true
}

const getNodeProps = ({ option }) => ({
    onContextmenu: e => handleContextMenu(e, option)
})

const dropdownOptions = [
    { label: '新建文件', key: 'new-file' },
    { label: '新建文件夹', key: 'new-folder' },
    { type: 'divider', key: 'd1' },
    { label: '刷新', key: 'refresh' }
]

const handleDropdownSelect = async key => {
    showDropdown.value = false
    if (key === 'new-file') await createItem('file')
    else if (key === 'new-folder') await createItem('folder')
    else if (key === 'refresh') {
        const subdir = currentNode.value ? (currentNode.value.isLeaf ? currentNode.value.key.split('/').slice(0, -1).join('/') : currentNode.value.key) : ''
        await refreshCurrentDirectory(subdir)
    }
}

const handleClickOutside = e => {
    if (e.button !== 2) showDropdown.value = false
}

watch(
    () => workspaceStore.root,
    newRoot => {
        if (newRoot) initTree()
    }
)

onMounted(() => {
    if (workspaceStore.root) initTree()
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="explorer-container">
        <div class="toolbar">
            <n-button quaternary circle size="tiny" @click="createItem('file')" title="新建文件">
                <template #icon><NewFileIcon /></template>
            </n-button>
            <n-button quaternary circle size="tiny" @click="createItem('folder')" title="新建文件夹">
                <template #icon><NewFolderIcon /></template>
            </n-button>
            <n-button quaternary circle size="tiny" @click="initTree" title="刷新列表">
                <template #icon><RefreshIcon /></template>
            </n-button>
            <n-button quaternary circle size="tiny" @click="expandedKeys = []" title="一键折叠">
                <template #icon><CollapseIcon /></template>
            </n-button>
        </div>

        <div v-if="loading" class="loading-state">
            <n-spin size="small" />
            <span>加载中...</span>
        </div>

        <n-tree v-else-if="treeData.length > 0" :data="treeData" block-line :on-load="handleLoad" :node-props="getNodeProps" v-model:expanded-keys="expandedKeys" v-model:selected-keys="selectedKeys" class="file-tree">
            <template #default="{ node }">
                <div style="width: 100%; cursor: pointer">{{ node.label }}</div>
            </template>
        </n-tree>

        <div v-else class="empty-state">
            <n-empty description="工作区为空" />
        </div>

        <n-dropdown trigger="manual" :show="showDropdown" :options="dropdownOptions" :x="dropdownPosition.x" :y="dropdownPosition.y" placement="bottom-start" @select="handleDropdownSelect" @clickoutside="handleClickOutside" />
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

.toolbar {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
    font-size: 13px;
    flex: 1;
    overflow: auto;
}
</style>
