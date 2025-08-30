<template>
  <ProgressSpinner v-if="isFetching" class="fixed left-1/2 top-1/2 z-20" />
  <nav class="z-20 bg-stone-800">
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="flex h-14 items-center">

        <!-- Mobile popover menu-->
        <Button class="md:hidden" icon="pi pi-bars" icon-class="text-stone-200" text @click="mobileMenu.show($event)"/>
        <Popover ref="mobileMenu"  class="!h-min !w-fit rounded text-sm">
          <SearchContainer class="bg-black text-white" @hide="mobileMenu.hide()"/>
          <div class="pt-2">
            <span class="border-b-2 border-emerald-600 text-sm">{{ __('Actions')}}</span>
            <Menu :model="navigation" class="border-none" />
            <hr/>
            <span class="border-b-2 border-emerald-600 text-sm">{{ __('Streams') }}</span>
            <Menu :model="streamMenu" class="border-none"/>
          </div>
        </Popover>

        <!-- Full nav bar -->
        <div class="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
          <div class="flex shrink-0 items-center pl-4 sm:pl-0">
            <router-link :to="{path: '/'}">
              <img class="h-8 w-auto" src="../assets/Socialhome-light.svg" alt="Socialhome" />
            </router-link>
            <span class="px-4 font-semibold italic text-stone-200">Socialhome</span>
          </div>
          <div class="hidden h-8 pl-8 text-sm md:flex">
            <SearchContainer />
          </div>
        </div>
        <div class="flex items-center">
          <Menubar ref="menuBar" :model="navigation" breakpoint="640px" class="hidden border-none bg-inherit text-sm md:inline-block"
                   :pt="{itemContent: 'text-stone-200 hover:text-stone-700', root: 'outline-none'}"
          />
          <div :class="[userIsAuthenticated ? '' : 'animate-pulse', 'px-8']">
            <Button text @click="loginMenu.show($event)">
              <img class="size-8 rounded-lg" :src="userIcon" alt="" />
            </Button>
          </div>
          <!-- Profile dropdown -->
          <Menu ref="loginMenu" popup :model="userIsAuthenticated ? signOutMenu : signInMenu" />
        </div>
      </div>
    </div>
  </nav>
  <LoginForm @close-form="hideLoginForm" :show-form="isSelected" />
  <ContentPublisher v-if="editorProps" />
  <PreferenceManager v-model:visible="showPreferences" />
</template>

<script setup>
import {computed, ref} from 'vue'
import { useRouter } from "vue-router"
import { storeToRefs } from 'pinia'
import LoginForm from '@/components/LoginForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useContentsStore } from '@/stores/contents'
import { Button, Menu, Menubar, Popover, ProgressSpinner } from "primevue"
import SearchContainer from "@/components/SearchContainer.vue"
import { useGettext} from "vue3-gettext"
import { signOut } from "@/helpers/utils"
import ContentPublisher from "@/components/ContentPublisher.vue"
import PreferenceManager from "@/components/PreferenceManager.vue"

const router = useRouter()
const { $gettext } = useGettext()
const { userIsAuthenticated, userIcon, user } = storeToRefs(useAuthStore())
const { logout } = useAuthStore()
const { editorProps, isFetching, streams } = storeToRefs(useContentsStore())
const { getStreamRoute, isAvailable, resetContent, setEditorProps } = useContentsStore()

const mobileMenu = ref()
const menuBar = ref()
// without this, the selected item remains outlined even if a command is executed
const menuBarFocus = (event) => menuBar.value.toggle(event)

const isSelected = ref(false)

function showLoginForm() {
  isSelected.value = true
}
function hideLoginForm() {
  isSelected.value = false
}

const editorIsShown = ref(false)
const showEditor = () => {
  editorIsShown.value = true
  setEditorProps({mode: 'create'})
  mobileMenu.value.hide()
}
const hideEditor = () => editorIsShown.value = false
const notificationsAreShown = ref(false)

const showNotifications = () => {
  notificationsAreShown.value = true
  mobileMenu.value.hide()
}
const hideNotifications = () => notificationsAreShown.value = false
const messagesAreShown = ref(false)

const showMessages = () => {
  messagesAreShown.value = true
  mobileMenu.value.hide()
}
const hideMessages = () => messagesAreShown.value = false

const navigation = [
  { icon: 'pi pi-pencil', label: $gettext('Create'), command: showEditor },
  { icon: 'pi pi-bell', label: $gettext('Notifications'), command: showNotifications },
  { icon: 'pi pi-envelope', label: $gettext('Messages'), command: showMessages },
]

const loginMenu = ref()
const signInMenu = [
  {label: $gettext('Sign In'), icon: 'pi pi-sign-in', command: showLoginForm},
  {label: $gettext('Register'), icon: 'pi pi-user-plus', disabled: true}
]

const showPreferences = ref(false)
const signOutMenu = [
  {label: $gettext('Profile'), icon: 'pi pi-user-edit',
    command: () => router.push({name: 'profile-pinned', params: {uuid: user.value.uuid}})},
  {label: $gettext('Preferences'), icon: 'pi pi-cog', command: () => showPreferences.value = true},
  {label: $gettext('Sign Out'), icon: 'pi pi-sign-out', command: signOut }
]

const streamMenu = computed(() => {
  let menu = []
  Object.keys(streams.value).forEach((name) => {
    if (isAvailable(name))
      menu.push({
        label: streams.value[name].name,
        icon: streams.value[name].icon,
        command: () => {router.push(getStreamRoute(name)), mobileMenu.value.hide()}
      })
  })
  return menu
})
</script>
