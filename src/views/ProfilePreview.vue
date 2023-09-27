<script setup lang="ts">
import { ref, onMounted, watchEffect, type CSSProperties } from "vue";
import { useMessage } from "naive-ui";
import copyText from "@/helpers/copyText";
import downloadTextFile from "@/helpers/downloadTextFile";
import type { Options } from "@/stores/options";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import generateReadmeHTML from "@/helpers/generate";
import useOptionsStore from "@/stores/options";
const optionsStore = useOptionsStore();
const { t } = useI18n();
const route = useRoute();
const message = useMessage();
const html = ref("");
const router = useRouter();
const shared = ref(false);
const options = ref<Options | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);
const loading = ref(false);
watchEffect(() => {
    let title = t("preview.title");
    if (options.value?.username) {
        title += " - " + options.value.username;
    }
    document.title = title;
});

watchEffect(() => {
    if (!wrapperRef.value) {
        return;
    }
    const timestamp = Date.now() + "";
    wrapperRef.value.dataset.timestamp = timestamp;
    wrapperRef.value.innerHTML = html.value;
    loading.value = true;
    const imgs = Array.from(wrapperRef.value.querySelectorAll("img"));
    Promise.allSettled(
        imgs.map((el) => {
            return new Promise<void>((resolve) => {
                el.onerror = el.onload = () => resolve();
            });
        })
    ).finally(() => {
        if (wrapperRef.value?.dataset.timestamp !== timestamp) {
            return;
        }
        loading.value = false;
    });
});

onMounted(() => {
    if (route.query.share) {
        shared.value = true;
        message.info(t("preview.sharedTip"));
    }
    if (!route.query.options) {
        message.warning(t("preview.noOption"));
        return;
    }
    try {
        const opt = JSON.parse(route.query.options as string);
        html.value = generateReadmeHTML(opt);
        options.value = opt;
    } catch {
        message.error(t("preview.invalidOption"));
    }
});

function onCopy() {
    copyText(html.value);
    message.success(t("preview.copySuccess"));
}
function onCopyShareLink() {
    const u = new URL(route.fullPath, location.href);
    u.searchParams.set("share", "true");
    // hash route
    u.hash = `#${u.pathname}${u.search}`;
    u.search = "";
    u.pathname = location.pathname;
    copyText(u.href);
    message.success(t("preview.copySuccess"));
}

function onDownload() {
    downloadTextFile(html.value, "README.md").then(() => {
        message.success(t("preview.downloadSuccess"));
    });
}
function onApply() {
    optionsStore.options = options.value!;
    message.success(t("preview.applySuccess"));
    router.push({ name: "edit" });
}
</script>

<template>
    <div>
        <n-tabs
            default-value="preview"
            animated
            type="line"
            size="large"
            :tabs-padding="20"
            pane-style="padding: 20px;"
        >
            <n-tab-pane name="readme.md" tab="README.md">
                <n-input
                    class="tab"
                    size="large"
                    spellcheck="false"
                    type="textarea"
                    v-model:value="html"
                />
            </n-tab-pane>
            <n-tab-pane name="preview" :tab="t('preview.preview')">
                <n-spin :show="loading">
                    <div class="tab" style="position: relative">
                        <n-layout
                            :native-scrollbar="false"
                            style="top: 0; bottom: 0; background-color: transparent"
                            position="absolute"
                        >
                            <div ref="wrapperRef" style="font-size: 16px"></div>
                        </n-layout>
                    </div>
                </n-spin>
            </n-tab-pane>
        </n-tabs>
        <div style="padding: 0 20px 20px; text-align: right">
            <n-button-group>
                <n-tooltip trigger="hover" arrow-point-to-center>
                    <template #trigger>
                        <n-button @click="onCopyShareLink" size="large" ghost>{{
                            t("preview.share")
                        }}</n-button>
                    </template>
                    {{ t("preview.shareTip") }}
                </n-tooltip>
                <n-tooltip v-if="options && shared" trigger="hover" arrow-point-to-center>
                    <template #trigger>
                        <n-button @click="onApply" size="large" ghost>{{
                            t("edit.apply")
                        }}</n-button>
                    </template>
                    {{ t("preview.applyTip") }}
                </n-tooltip>
                <n-button @click="onCopy" size="large" ghost>{{ t("preview.copy") }}</n-button>
                <n-button @click="onDownload" size="large" ghost>{{ t("edit.download") }}</n-button>
                <n-button size="large" ghost @click="router.push({ name: 'edit' })">
                    {{ t("edit.returnToEdit") }}
                </n-button>
            </n-button-group>
        </div>
    </div>
</template>

<style scoped lang="less">
.tab {
    height: 50vh;
    min-height: 360px;
}
</style>
