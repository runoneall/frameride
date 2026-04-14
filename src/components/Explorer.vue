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

// 树形数据
const treeData = ref([])
// 加载中状态
const loading = ref(false)
// 已加载的目录键集合
const loadedKeys = ref(new Set())
// 展开的键
const expandedKeys = ref([])
// 选中的键
const selectedKeys = ref([])
// 树引用
const treeRef = ref(null)

// 右键菜单相关
const showDropdown = ref(false)
const dropdownPosition = ref({ x: 0, y: 0 })
const currentNode = ref(null)

// 获取文件名（不含路径）
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

// 将文件列表转换为树节点格式
const convertToTreeNodes = items => {
    return items.map(item => ({
        key: item.path,
        label: getBaseName(item.path),
        isLeaf: item.type === 'file',
        children: undefined,
        _raw: item
    }))
}

// 加载指定目录的文件
const loadDirectory = async (subdir = '') => {
    try {
        const files = await window.api.getWorkspaceFiles(subdir)
        return convertToTreeNodes(files)
    } catch (error) {
        console.error('加载目录失败:', error)
        return []
    }
}

// 初始化加载根目录
const initTree = async () => {
    if (!workspaceStore.root) return

    loading.value = true
    loadedKeys.value.clear()
    expandedKeys.value = []
    selectedKeys.value = []

    try {
        treeData.value = await loadDirectory('')
    } finally {
        loading.value = false
    }
}

// 递归查找并更新节点的 children
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

// 懒加载函数 - n-tree 的 onLoad 回调
const handleLoad = async node => {
    // 避免重复加载
    if (loadedKeys.value.has(node.key)) {
        return node.children || []
    }

    const children = await loadDirectory(node.key)
    loadedKeys.value.add(node.key)

    // 手动更新树数据中的节点
    updateNodeChildren(treeData.value, node.key, children)

    return children
}

// 获取当前活动的目录(优先使用选中节点,否则使用第一个展开的目录)
const getTargetSubdir = () => {
    // 如果有选中的节点,优先使用
    if (selectedKeys.value.length > 0) {
        const selectedKey = selectedKeys.value[0]
        const selectedNode = findNodeByKey(treeData.value, selectedKey)

        if (selectedNode) {
            if (selectedNode.isLeaf) {
                // 如果是文件,获取其父目录
                const pathParts = selectedKey.replace(/\\/g, '/').split('/')
                pathParts.pop()
                return pathParts.join('/')
            } else {
                // 如果是目录,直接使用该目录
                return selectedKey
            }
        }
    }

    // 如果没有选中节点,使用第一个展开的目录作为目标
    if (expandedKeys.value.length > 0) {
        return expandedKeys.value[0]
    }

    // 默认返回根目录
    return ''
}

// 递归查找节点
const findNodeByKey = (nodes, key) => {
    for (const node of nodes) {
        if (node.key === key) {
            return node
        }
        if (node.children) {
            const found = findNodeByKey(node.children, key)
            if (found) return found
        }
    }
    return null
}

// 新建文件
const handleNewFile = async () => {
    const targetDir = getTargetSubdir()

    const inputFileName = ref('')

    const fileName = await new Promise(resolve => {
        dialog.info({
            title: '新建文件',
            content: () =>
                h('div', [
                    h('p', { style: 'margin-bottom: 12px;' }, '请输入文件名（包含扩展名）'),
                    h('input', {
                        class: 'new-file-input',
                        value: inputFileName.value,
                        onInput: e => {
                            inputFileName.value = e.target.value
                        },
                        style: 'width: 100%; padding: 6px 10px; border: 1px solid #505050; border-radius: 4px; background: #1e1e1e; color: #fff; box-sizing: border-box;',
                        placeholder: '例如: index.js'
                    })
                ]),
            positiveText: '创建',
            negativeText: '取消',
            onPositiveClick: () => {
                resolve(inputFileName.value.trim())
            },
            onNegativeClick: () => {
                resolve('')
            },
            onClose: () => {
                resolve('')
            }
        })

        // 自动聚焦输入框
        setTimeout(() => {
            const inputEl = document.querySelector('.new-file-input')
            if (inputEl) inputEl.focus()
        }, 100)
    })

    if (!fileName) {
        return
    }

    try {
        const fullPath = targetDir ? `${targetDir}/${fileName}` : fileName
        await window.api.createFile(fullPath)

        dialog.success({
            title: '成功',
            content: `文件 "${fileName}" 创建成功`,
            positiveText: '确定'
        })

        // 刷新树
        await refreshCurrentDirectory(targetDir)
    } catch (error) {
        dialog.error({
            title: '错误',
            content: `创建文件失败: ${error.message}`,
            positiveText: '确定'
        })
    }
}

// 新建文件夹
const handleNewFolder = async () => {
    const targetDir = getTargetSubdir()

    const inputFolderName = ref('')

    const folderName = await new Promise(resolve => {
        dialog.info({
            title: '新建文件夹',
            content: () =>
                h('div', [
                    h('p', { style: 'margin-bottom: 12px;' }, '请输入文件夹名称'),
                    h('input', {
                        class: 'new-folder-input',
                        value: inputFolderName.value,
                        onInput: e => {
                            inputFolderName.value = e.target.value
                        },
                        style: 'width: 100%; padding: 6px 10px; border: 1px solid #505050; border-radius: 4px; background: #1e1e1e; color: #fff; box-sizing: border-box;',
                        placeholder: '例如: src'
                    })
                ]),
            positiveText: '创建',
            negativeText: '取消',
            onPositiveClick: () => {
                resolve(inputFolderName.value.trim())
            },
            onNegativeClick: () => {
                resolve('')
            },
            onClose: () => {
                resolve('')
            }
        })

        // 自动聚焦输入框
        setTimeout(() => {
            const inputEl = document.querySelector('.new-folder-input')
            if (inputEl) inputEl.focus()
        }, 100)
    })

    if (!folderName) {
        return
    }

    try {
        const fullPath = targetDir ? `${targetDir}/${folderName}` : folderName
        await window.api.createDir(fullPath)

        dialog.success({
            title: '成功',
            content: `文件夹 "${folderName}" 创建成功`,
            positiveText: '确定'
        })

        // 刷新树
        await refreshCurrentDirectory(targetDir)
    } catch (error) {
        dialog.error({
            title: '错误',
            content: `创建文件夹失败: ${error.message}`,
            positiveText: '确定'
        })
    }
}

// 刷新当前目录
const refreshCurrentDirectory = async (subdir = '') => {
    loading.value = true
    try {
        if (subdir === '') {
            // 刷新根目录
            treeData.value = await loadDirectory('')
            loadedKeys.value.clear()
        } else {
            // 刷新指定子目录
            const children = await loadDirectory(subdir)
            loadedKeys.value.add(subdir)
            updateNodeChildren(treeData.value, subdir, children)
        }
    } finally {
        loading.value = false
    }
}

// 刷新列表
const handleRefresh = async () => {
    await initTree()
}

// 一键折叠
const handleCollapseAll = () => {
    expandedKeys.value = []
}

// 处理右键菜单
const handleContextMenu = (e, node) => {
    e.preventDefault()
    e.stopPropagation()

    // 设置当前右键点击的节点为选中状态
    selectedKeys.value = [node.key]
    currentNode.value = node

    dropdownPosition.value = { x: e.clientX, y: e.clientY }
    showDropdown.value = true
}

// 右键菜单选项
const dropdownOptions = [
    {
        label: '新建文件',
        key: 'new-file'
    },
    {
        label: '新建文件夹',
        key: 'new-folder'
    },
    {
        type: 'divider',
        key: 'd1'
    },
    {
        label: '刷新',
        key: 'refresh'
    }
]

// 处理菜单选择
const handleDropdownSelect = async key => {
    showDropdown.value = false

    switch (key) {
        case 'new-file':
            await handleNewFile()
            break
        case 'new-folder':
            await handleNewFolder()
            break
        case 'refresh':
            if (currentNode.value) {
                const subdir = currentNode.value.isLeaf ? currentNode.value.key.split('/').slice(0, -1).join('/') : currentNode.value.key
                await refreshCurrentDirectory(subdir)
            } else {
                await initTree()
            }
            break
    }
}

// 点击外部关闭菜单
const handleClickOutside = () => {
    showDropdown.value = false
}

// 监听 root 变化
watch(
    () => workspaceStore.root,
    newRoot => {
        if (newRoot) initTree()
    }
)

// 组件挂载时初始化
onMounted(() => {
    if (workspaceStore.root) initTree()
    document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="explorer-container">
        <!-- 工具栏 -->
        <div class="toolbar">
            <n-button quaternary circle size="tiny" @click="handleNewFile" title="新建文件">
                <template #icon>
                    <NewFileIcon />
                </template>
            </n-button>
            <n-button quaternary circle size="tiny" @click="handleNewFolder" title="新建文件夹">
                <template #icon>
                    <NewFolderIcon />
                </template>
            </n-button>
            <n-button quaternary circle size="tiny" @click="handleRefresh" title="刷新列表">
                <template #icon>
                    <RefreshIcon />
                </template>
            </n-button>
            <n-button quaternary circle size="tiny" @click="handleCollapseAll" title="一键折叠">
                <template #icon>
                    <CollapseIcon />
                </template>
            </n-button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
            <n-spin size="small" />
            <span>加载中...</span>
        </div>

        <!-- 文件树 -->
        <n-tree v-else-if="treeData.length > 0" ref="treeRef" :data="treeData" block-line :on-load="handleLoad" v-model:expanded-keys="expandedKeys" v-model:selected-keys="selectedKeys" class="file-tree">
            <template #default="{ node }">
                <div @contextmenu="e => handleContextMenu(e, node)" style="width: 100%; cursor: pointer">
                    {{ node.label }}
                </div>
            </template>
        </n-tree>

        <!-- 空状态 -->
        <div v-else class="empty-state">
            <n-empty description="工作区为空" />
        </div>

        <!-- 右键菜单 -->
        <n-dropdown :show="showDropdown" :options="dropdownOptions" :x="dropdownPosition.x" :y="dropdownPosition.y" placement="bottom-start" @select="handleDropdownSelect" @clickoutside="handleClickOutside" />
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

/* 自定义树节点样式 */
.file-tree :deep(.n-tree-node-content) {
    padding: 4px 8px;
}

.file-tree :deep(.n-tree-node-content:hover) {
    background-color: rgba(255, 255, 255, 0.05);
}

.file-tree :deep(.n-tree-node-content--selected) {
    background-color: rgba(64, 158, 255, 0.2);
}
</style>
