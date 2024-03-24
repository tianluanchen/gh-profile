<script setup lang="ts">
import { ref, watch, computed, watchEffect } from "vue";
import type { FormInst, FormRules, FormItemRule } from "naive-ui";
import { useMessage } from "naive-ui";
import { isValidUsername, isValidUrl, isValidGenerateOption } from "@/helpers/validate";
import useOptionsStore from "@/stores/options";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const optionsStore = useOptionsStore();
const { options } = storeToRefs(optionsStore);
const { t } = useI18n();
const formRef = ref<FormInst | null>(null);
const router = useRouter();
const rules = computed<FormRules>(() => {
    return {
        api: {
            required: true,
            message: t("edit.apiError"),
            trigger: "blur",
            validator(rule: FormItemRule, value: string) {
                return isValidUrl(value);
            }
        },
        username: {
            required: true,
            message: t("edit.usernameError"),
            trigger: ["input", "blur"],
            validator(rule: FormItemRule, value: string) {
                return isValidUsername(value);
            }
        }
    };
});
watchEffect(() => {
    const title = t("layout.title");
    if (options.value.username !== "") {
        document.title = `${title} - ${options.value.username}`;
    } else {
        document.title = title;
    }
});

watch(
    () => options.value.username,
    (newValue, oldValue) => {
        if (newValue !== oldValue) {
            options.value.avatar = "";
        }
    }
);

const themeOptions = [
    "default",
    "dark",
    "radical",
    "merko",
    "gruvbox",
    "tokyonight",
    "onedark",
    "cobalt",
    "synthwave",
    " highcontrast",
    "dracula"
].map((e) => {
    return {
        label: e,
        value: e
    };
});

const topLangsCardLayoutRadios = computed(() => {
    return [
        {
            value: "compact",
            label: t("edit.compactLayout")
        },
        {
            value: "default",
            label: t("edit.defaultLayout")
        }
    ];
});

const loading = ref(false);
const message = useMessage();

async function getUserInfo() {
    const username = options.value.username;
    if (!isValidUsername(username)) {
        message.warning(t("edit.usernameError"));
        return;
    }
    loading.value = true;
    const handle = message.loading(t("edit.loadingUserInfo"), {
        duration: 1000 * 60 * 300
    });
    try {
        const resp = await fetch("/query/" + username);
        const text = await resp.text();
        if (resp.status !== 200) {
            throw new Error(text);
        }
        const data = JSON.parse(text);
        options.value.avatar = data.avatar;
        options.value.repoList = data.repoList;
        message.success(t("edit.loadSuccessTip"));
    } catch (error) {
        message.error(String(error));
    }
    handle.destroy();
    loading.value = false;
}

function onGenerate() {
    formRef
        .value!.validate()
        .then(() => {
            optionsStore.clean();
            router.push({
                name: "preview",
                query: {
                    options: JSON.stringify(options.value)
                }
            });
        })
        .catch((r) => {
            message.error(r[0][0].message);
        });
}

function onReset() {
    optionsStore.reset();
    message.success(t("edit.resetSuccess"));
}
</script>

<template>
    <div>
        <n-form size="large" ref="formRef" :model="options" :rules="rules">
            <n-form-item :label="t('edit.username')" path="username">
                <div class="user-group">
                    <n-avatar
                        v-if="options.avatar"
                        size="large"
                        round
                        :src="options.avatar"
                        lazy
                    ></n-avatar>
                    <n-avatar
                        v-else
                        size="large"
                        round
                        src="https://avatars.githubusercontent.com/u/75252550?v=4"
                    >
                        {{ options.username }}
                    </n-avatar>
                    <n-input-group>
                        <n-input
                            @keydown.enter="getUserInfo"
                            :disabled="loading"
                            round
                            clearable
                            v-model:value="options.username"
                            :placeholder="t('edit.enterUsernameTip')"
                        />
                        <n-tooltip trigger="hover" arrow-point-to-center>
                            <template #trigger>
                                <n-button
                                    @click="getUserInfo"
                                    :loading="loading"
                                    strong
                                    secondary
                                    round
                                    type="primary"
                                >
                                    {{ t("edit.loadData") }}
                                </n-button>
                            </template>
                            {{ t("edit.loadDataTip") }}
                        </n-tooltip>
                    </n-input-group>
                </div>
            </n-form-item>
            <n-form-item :label="t('edit.apiLabel')" path="api">
                <n-input-group>
                    <n-input
                        v-model:value="options.api"
                        clearable
                        :placeholder="t('edit.enterApiTip')"
                    />
                    <n-button @click="optionsStore.reset('api')" strong secondary type="primary">
                        {{ t("edit.useDefault") }}
                    </n-button>
                </n-input-group>
            </n-form-item>
            <n-form-item :label="t('edit.themeLabel')" path="theme">
                <n-select v-model:value="options.theme" filterable :options="themeOptions" />
            </n-form-item>
            <n-form-item :label="t('edit.topLangsCardLayoutLabel')">
                <n-radio-group v-model:value="options.topLangsCardLayout">
                    <n-space>
                        <n-radio
                            v-for="item in topLangsCardLayoutRadios"
                            :key="item.value"
                            :value="item.value"
                        >
                            {{ item.label }}
                        </n-radio>
                    </n-space>
                </n-radio-group>
            </n-form-item>
            <n-form-item :label="t('exit.excludedTopLangsLabel')" path="excludedTopLangs">
                <n-dynamic-tags v-model:value="options.excludedTopLangs" />
            </n-form-item>
            <n-form-item :label="t('edit.pinnedCardAlignLabel')" path="pinnedCardAlign">
                <n-switch v-model:value="options.pinnedCardAlign" />
            </n-form-item>
            <n-form-item :label="t('edit.pinnedCardLargeGapLabel')" path="pinnedCardLargeGap">
                <n-switch v-model:value="options.pinnedCardLargeGap" />
            </n-form-item>
            <n-form-item :label="t('edit.addOrRemoveRepo')" path="repoList">
                <n-dynamic-input
                    :disabled="loading"
                    v-model:value="options.repoList"
                    show-sort-button
                    :placeholder="t('edit.enterRepoTip')"
                />
            </n-form-item>
            <n-space vertical size="large" style="margin: 1.5rem auto">
                <n-button
                    :disabled="loading"
                    size="large"
                    @click="onGenerate"
                    type="primary"
                    style="width: 100%; text-align: center"
                >
                    {{ t("edit.generate") }}
                </n-button>
                <n-button
                    :disabled="loading"
                    size="large"
                    @click="onReset"
                    type="info"
                    style="width: 100%; text-align: center"
                >
                    {{ t("edit.reset") }}
                </n-button>
            </n-space>
        </n-form>
    </div>
</template>

<style scoped lang="less">
.user-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;

    & > :first-child {
        flex-shrink: 0;
    }

    & > :last-child {
        flex-grow: 1;
    }
}
</style>
