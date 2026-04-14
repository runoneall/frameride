<script setup>
const menuopt = [
    {
        label: '工作区',
        children: [
            {
                label: '打开',
                call: () => console.log('打开')
            }
        ]
    }
]

const onclick = (_, item) => item.call()
</script>

<template>
    <n-menu class="top-menu" mode="horizontal" :options="menuopt" @update:value="onclick" />
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
