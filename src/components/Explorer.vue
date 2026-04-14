<script setup>
import { useWorkspaceStore } from '../stores/workspace'
const workspace = useWorkspaceStore()
console.log(workspace.root)
</script>

<template></template>

<style scoped></style>
