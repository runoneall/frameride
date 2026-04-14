<script setup>
const menuOptions = [
    {
        label: '工作区',
        key: 'workspace',
        callback: () => {}
    }
]

const handleMenuClick = (key, item) => {
    const menuItem = menuOptions.find(option => option.key === key)
    if (menuItem && menuItem.callback) {
        menuItem.callback()
    }
}
</script>

<template>
    <n-menu class="top-menu" mode="horizontal" :options="menuOptions.map(({ label, key }) => ({ label, key }))" @update:value="handleMenuClick" />
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
    padding: 0 10px;
}
</style>
