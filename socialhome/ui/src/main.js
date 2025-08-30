import './index.css'
import './helpers/wp-embed.js'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import { useAuthStore } from '@/stores/auth.js'
import { useNow } from "@vueuse/core"
import App from './App.vue'
import router from './routes.js'
import gettext from "@/helpers/gettext"
import { OhVueIcon, addIcons } from "oh-vue-icons"
import {
    BiCaretDown,
    BiCaretUpFill,
    BiCheck2,
    BiChevronExpand,
    BiEye,
    BiGlobe2,
    BiPerson,
    FaCamera,
    FaCode,
    FaLink,
    FaListOl,
    FaListUl,
    FaQuoteLeft,
    FaRegularImage,
    HiCheck,
    HiHome,
    HiLockClosed,
    HiUserGroup,
    HiSolidMinus,
    IoChatbubbles,
    IoPersonOutline,
    LaEllipsisVSolid } from "oh-vue-icons/icons"
   // import aura from "@/presets/aura"

addIcons(
    BiCaretDown,
    BiCaretUpFill,
    BiCheck2,
    BiChevronExpand,
    BiEye,
    BiGlobe2,
    BiPerson,
    FaCamera,
    FaCode,
    FaLink,
    FaListOl,
    FaListUl,
    FaQuoteLeft,
    FaRegularImage,
    HiCheck,
    HiHome,
    HiLockClosed,
    HiUserGroup,
    HiSolidMinus,
    IoChatbubbles,
    IoPersonOutline,
    LaEllipsisVSolid)


const app = createApp(App)
const pinia = createPinia()
app.component("v-icon", OhVueIcon)
const { $gettext } = gettext
app.use(PrimeVue, {
    theme: 'none',
    locale: {
        choose: $gettext('Choose'),
        noFileChosenMessage: $gettext('No file chosen')
    }
})
app.use(ToastService)
app.use(ConfirmationService)
app.use(pinia)
app.use(gettext)
app.provide('now', useNow({interval: 10000}))
const authStore = useAuthStore()
authStore.getAuthenticatedUser().then(() => app.use(router))
router.isReady().then(() => {
    app.mount('#app')
    })
