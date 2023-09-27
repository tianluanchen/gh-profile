import { defineStore } from "pinia";
import { ref } from "vue";
import { piniaWithStorageEvents } from "@/helpers/storageEvt";
type Lng = "zh" | "en";
const useLanguageStore = defineStore(
    "language",
    () => {
        const language = ref<Lng>(window.navigator.language.startsWith("zh-") ? "zh" : "en");
        function setLanguage(l: Lng) {
            language.value = l;
        }
        return { language, setLanguage };
    },
    {
        persist: {
            afterRestore(ctx) {
                piniaWithStorageEvents(ctx.store);
            }
        }
    }
);

export default useLanguageStore;
