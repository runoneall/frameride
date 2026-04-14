<script setup>
import { useWorkspaceStore } from '../stores/workspace'
const workspaceStore = useWorkspaceStore()

console.log(workspaceStore.WORKSPACE_ROOT)
</script>

<template></template>

<style scoped></style>
