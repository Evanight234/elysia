import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import id from "./locales/id.json";
import ja from "./locales/ja.json";
import cn from "./locales/cn.json";

const savedLang = localStorage.getItem("elysiaapp_lang") || "en";

i18next
    .use(initReactI18next)
    .init({
        resources: {
            id: { translation: id },
            en: { translation: en },
            ja: { translation: ja },
            cn: { translation: cn }
        },
        lng: savedLang,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    })

export default i18next

