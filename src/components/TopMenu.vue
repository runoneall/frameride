<script setup>
import { ref } from 'vue'

const menuOptions = [
    {
        label: '工作区',
        key: 'workspace',
        children: [
            {
                label: '打开',
                key: 'open'
            }
        ]
    }
]

const activeKey = ref(null)
const handleMenuClick = (key, item) => {
    activeKey.value = null

    console.log(key, item)
}
</script>

<template>
    <n-menu class="top-menu" mode="horizontal" :options="menuOptions" v-model:value="activeKey" @update:value="handleMenuClick" />
</template>

<style scoped>
.top-menu {
    height: 100%;
}

.top-menu :deep(.n-menu-item) {
    height: 100%;
    margin-top: 1px;
}

.top-menu :deep(.n-menu-item-content) {
    height: 100%;
    padding: 0 10px;
}
</style>
