<script setup lang="ts">
import AppHeader from "./header/AppHeader.vue";
import { RouterView } from "vue-router";
import { useLoadingBar } from "naive-ui";
import { hookBar } from "@/hooks/useGlobalLoadingBar";
import { onMounted, onUnmounted } from "vue";
onMounted(() => {
    hookBar(useLoadingBar());
});

onUnmounted(() => {
    hookBar(null);
});
</script>

<template>
    <n-layout style="height: 100vh">
        <app-header></app-header>
        <n-layout
            position="absolute"
            style="top: 64px"
            embedded
            content-style="padding: 24px;"
            :native-scrollbar="false"
        >
            <n-card style="max-width: 1280px; margin: auto">
                <RouterView v-slot="{ Component, route }">
                    <n-spin v-if="!Component">
                        <div style="height: 50vh; max-height: 400px"></div>
                    </n-spin>
                    <Transition v-else name="fade-in" mode="out-in">
                        <component :is="Component" :key="route.name" />
                    </Transition>
                </RouterView>
            </n-card>
            <n-back-top :right="40" />
        </n-layout>
    </n-layout>
</template>

<style scoped lang="less">
.fade-in-leave-active,
.fade-in-enter-active {
    transition: all 0.2s;
}

.fade-in-enter-from {
    opacity: 0;
    transition: all 0.2s;
    transform: translateX(-30px);
}

.fade-in-leave-to {
    opacity: 0;
    transition: all 0.2s;
    transform: translateX(30px);
}
</style>
