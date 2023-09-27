<script setup lang="ts">
import useThemeStore from "@/stores/theme";
import { zhCN, enUS, darkTheme } from "naive-ui";
import { useI18n } from "vue-i18n";
import { watchEffect } from "vue";
import AppLayout from "./layout/AppLayout.vue";
import useLanguageStore from "@/stores/language";

const { isDark } = useThemeStore();
const lngStore = useLanguageStore();
const i18n = useI18n();

watchEffect(() => {
    i18n.locale.value = lngStore.language;
    document.documentElement.lang = i18n.locale.value;
});

watchEffect(() => {
    isDark()
        ? document.documentElement.classList.add("dark")
        : document.documentElement.classList.remove("dark");
});
</script>
<template>
    <n-config-provider
        :locale="lngStore.language == 'zh' ? zhCN : enUS"
        :theme="isDark() ? darkTheme : null"
    >
        <n-loading-bar-provider>
            <n-message-provider>
                <n-dialog-provider>
                    <app-layout></app-layout>
                </n-dialog-provider>
            </n-message-provider>
        </n-loading-bar-provider>
    </n-config-provider>
</template>

<style scoped lang="less"></style>
