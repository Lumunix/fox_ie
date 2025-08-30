import {createGettext} from "vue3-gettext";
import translations from "../language/translations.json";

console.log('languages', navigator.languages)
export default createGettext({
    availableLanguages: {
        en: "English",
        de: "German",
        fr: "Français",
        fr_CA: "Français (Canada)",
        zh_Hans: "Chinese (Simplfied Han script)"
    },
    defaultLanguage: navigator.language.replace('-', '_'),
    setGlobalProperties: true,
    globalProperties: { // custom global properties name
        gettext: ['$gettext', '__'],
        pgettext: ['$pgettext', '_n'],
        ngettext: ['$ngettext','_x'],
        npgettext: ['$npgettext', '_nx'],
    },
    translations: translations,
})
