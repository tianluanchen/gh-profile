<script setup lang="ts">
import useThemeStore from "@/stores/theme";
const themeStore = useThemeStore();
</script>

<template>
    <n-switch :value="themeStore.isDark()" @update:value="themeStore.toggleTheme">
        <template #checked>
            <span style="font-size: 13px">🌙</span>
        </template>
        <template #unchecked>
            <span style="font-size: 13px">☀️</span>
        </template>
    </n-switch>
</template>

<style scoped lang="less"></style>
