import { defineStore } from "pinia";
import { ref } from "vue";
import { usePreferredDark } from "@vueuse/core";
import { piniaWithStorageEvents } from "@/helpers/storageEvt";
const useThemeStore = defineStore(
    "theme",
    () => {
        const theme = ref<"dark" | "light">(usePreferredDark().value ? "dark" : "light");
        function toggleTheme() {
            theme.value = theme.value == "dark" ? "light" : "dark";
        }
        function isDark() {
            return theme.value == "dark";
        }
        return { theme, toggleTheme, isDark };
    },
    {
        persist: {
            afterRestore(ctx) {
                piniaWithStorageEvents(ctx.store);
            }
        }
    }
);

export default useThemeStore;
