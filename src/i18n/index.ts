import { createI18n } from "vue-i18n";
import zh from "./locales/zh.json";
import en from "./locales/en.json";
const i18n = createI18n({
    legacy: false,
    fallbackLocale: "en",
    messages: {
        en,
        zh
    }
});
export default i18n;
