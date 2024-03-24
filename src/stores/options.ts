import { piniaWithStorageEvents } from "@/helpers/storageEvt";
import { defineStore } from "pinia";
import { ref } from "vue";
import type { GenerateOption } from "@/helpers/generate";
type Options = GenerateOption & {
    avatar: string;
};
type OptionKey = keyof Options;

export type { Options, OptionKey };

const defaultOptions: () => Options = () => ({
    username: "",
    avatar: "",
    repoList: [],
    api: "https://github-readme-stats.vercel.app",
    theme: "default",
    topLangsCardLayout: "compact",
    excludedTopLangs: ["css", "html", "less", "scss"],
    pinnedCardAlign: true,
    pinnedCardLargeGap: false
});

const useOptionsStore = defineStore(
    "options",
    () => {
        const options = ref(defaultOptions());
        function reset(key?: OptionKey) {
            if (!key) {
                options.value = defaultOptions();
            } else {
                // @ts-ignore
                options.value[key] = defaultOptions()[key];
            }
        }
        function clean() {
            Object.entries(options.value).forEach(([k, v]) => {
                if (typeof v === "string") {
                    v = v.trim();
                } else if (Array.isArray(v)) {
                    v = v.map((e) => e.trim());
                } else {
                    return;
                }
                // @ts-ignore
                options.value[k] = v;
            });
        }
        return { options, reset, clean };
    },
    {
        persist: {
            afterRestore(ctx) {
                piniaWithStorageEvents(ctx.store);
            }
        }
    }
);

export default useOptionsStore;
