<script setup>
import { ref, watch, h } from 'vue'
import { useDialog, NInput } from 'naive-ui'
import { useWorkspaceStore } from '../stores/workspace'

import NewFileIcon from '../icons/NewFileIcon.vue'
import NewFolderIcon from '../icons/NewFolderIcon.vue'
import RefreshIcon from '../icons/RefreshIcon.vue'
import CollapseIcon from '../icons/CollapseIcon.vue'

const workspace = useWorkspaceStore()
const dialog = useDialog()
const treedata = ref([])
const expandkey = ref([])
const selectkey = ref([])

const loadtree = async node => {
    const data = await window.api.getWorkspaceFiles(node?.key)
    const mapped = data.map(item => ({
        label: item.name,
        key: item.path,
        isLeaf: item.isfile
    }))

    if (node) {
        node.children = mapped
    } else {
        treedata.value = mapped
    }
}

const splitpath = path => path.split(/[\\/]/).filter(item => item)

const getselectdir = () => {
    if (selectkey.value.length === 0) return ''
    const keys = splitpath(selectkey.value[0])

    let curpath = ''
    let nodes = treedata.value

    for (const key of keys) {
        const node = nodes.find(n => n.label === key)
        if (!node) break
        if (node.isLeaf) return curpath

        curpath = node.key
        nodes = node.children || []
    }

    return curpath
}

const askinput = (title, callback) => {
    const input = ref('')

    dialog.create({
        title,
        content: () =>
            h(NInput, {
                placeholder: ' ',
                autofocus: true,

                value: input.value,
                'onUpdate:value': val => {
                    input.value = val
                },

                onKeydown: e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()

                        const val = input.value.trim()
                        if (val) {
                            callback(val)
                            dialog.destroyAll()
                        }
                    }
                }
            }),

        positiveText: '确定',
        negativeText: '取消',

        onPositiveClick: () => {
            const val = input.value.trim()
            if (!val) return false

            callback(val)
            return true
        }
    })
}

const askconfirm = (title, callback) => {
    dialog.create({
        title,
        positiveText: '确定',
        negativeText: '取消',

        onPositiveClick: () => {
            callback()
            return true
        }
    })
}

const newfile = () => {
    const basedir = getselectdir()
    const folder = basedir === '' ? '根目录' : basedir

    askinput(`在 ${folder} 中新建文件`, async name => {
        await window.api.createFile(basedir + '/' + name)
        refresh()
    })
}

const newfolder = () => {
    const basedir = getselectdir()
    const folder = basedir === '' ? '根目录' : basedir

    askinput(`在 ${folder} 中新建目录`, async name => {
        await window.api.createDir(basedir + '/' + name)
        refresh()
    })
}

const refresh = () => loadtree()

const collapse = () => (expandkey.value = [])

const remove = () => {
    if (selectkey.value.length === 0) return
    const target = selectkey.value[0]

    askconfirm(`确定删除 ${target} 吗？`, async () => {
        await window.api.delWorkspaceFiles(target)
        refresh()
    })
}

const rename = async () => {}

const menux = ref(0)
const menuy = ref(0)
const menushow = ref(false)
const menuclose = () => (menushow.value = false)
const menuselect = async (_, item) => await item.call()

const menuopt = [
    {
        label: '新建',
        key: 'new',
        children: [
            {
                label: '文件',
                call: newfile
            },
            {
                label: '目录',
                call: newfolder
            }
        ]
    },
    {
        label: '刷新',
        call: refresh
    },
    {
        label: '折叠',
        call: collapse
    },
    {
        label: '删除',
        call: remove
    },
    {
        label: '重命名',
        call: rename
    }
]

const mousemenu = e => {
    e.preventDefault()
    menushow.value = true
    menux.value = e.clientX
    menuy.value = e.clientY
}

const nodeprop = ({ option }) => {
    return {
        onContextmenu: e => {
            selectkey.value = [option.key]
            mousemenu(e)
        }
    }
}

watch(
    () => workspace.root,
    () => loadtree(),
    { immediate: true }
)
</script>

<template>
    <div style="height: 100%; display: flex; flex-direction: column">
        <div class="top-tools">
            <n-button text @click="newfile">
                <template #icon>
                    <NewFileIcon class="icon" />
                </template>
            </n-button>
            <n-button text @click="newfolder">
                <template #icon>
                    <NewFolderIcon class="icon" />
                </template>
            </n-button>
            <n-button text @click="refresh">
                <template #icon>
                    <RefreshIcon class="icon" />
                </template>
            </n-button>
            <n-button text @click="collapse">
                <template #icon>
                    <CollapseIcon class="icon" />
                </template>
            </n-button>
        </div>

        <n-dropdown placement="bottom-start" trigger="manual" :x="menux" :y="menuy" :options="menuopt" :show="menushow" :on-clickoutside="menuclose" @update:show="v => (menushow = v)" @select="menuselect" />

        <n-scrollbar x-scrollable trigger="none" style="flex: 1" @contextmenu="mousemenu">
            <n-tree block-line expand-on-click show-line :data="treedata" :on-load="loadtree" v-model:expanded-keys="expandkey" v-model:selected-keys="selectkey" :node-props="nodeprop"></n-tree>
        </n-scrollbar>
    </div>
</template>

<style scoped>
.top-tools {
    height: 30px;
    margin: 0 10px;
    column-gap: 5px;
    display: flex;
    align-items: center;
}

.top-tools .icon {
    min-width: 20px;
    max-height: 20px;
    color: lightblue;
}

:deep(.n-tree-node-content__text) {
    white-space: nowrap;
}
</style>
