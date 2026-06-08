import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import id from "./locales/id.json";
import ja from "./locales/ja.json";
import cn from "./locales/cn.json";
import ru from "./locales/ru.json";
import jv from "./locales/jv.json";
import es from "./locales/es.json";
import de from "./locales/de.json";

// NOTE: savedLang is persisted in localStorage so the selected language remains after refresh
const savedLang = localStorage.getItem("elysiaapp_lang") || "en";

i18next
    .use(initReactI18next)
    .init({
        resources: {
            id: { translation: id },
            en: { translation: en },
            ja: { translation: ja },
            cn: { translation: cn },
            ru: { translation: ru },
            jv: { translation: jv },
            es: { translation: es },
            de: { translation: de }
        },
        lng: savedLang,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    })

export default i18next

