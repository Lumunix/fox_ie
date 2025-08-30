<script setup>
import {computed, onActivated, onUpdated, ref} from "vue"
import { useContentsStore } from "@/stores/contents"
import { useProfilesStore } from "@/stores/profiles";
import { storeToRefs} from "pinia"
import {useAuthStore} from "@/stores/auth"
import { useToast } from 'primevue/usetoast'
import { useGettext } from "vue3-gettext"
import { Button, InputText, Menu, Panel, Popover } from 'primevue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import {Markdown} from "tiptap-markdown"
import UploadMedia from "@/helpers/UploadMedia.vue"


const {uuid} = defineProps(['uuid'])
const { $gettext } = useGettext()

const { userIsAuthenticated } = storeToRefs(useAuthStore())
const { isAuthenticatedUser } = useAuthStore()
const { setEditorProps } = useContentsStore()
const { profiles } = storeToRefs(useProfilesStore())
const { followChange, updateProfile } = useProfilesStore()
const toast = useToast()
const profile = computed(() => profiles.value[uuid] ?? {})
const notImplemented = () => toast.add({severity: 'info', summary: $gettext('Not implemented yet'),
  detail: $gettext('This function will be implemented later'), life: 5000})
const actionMenu = ref()
const toggleActions = (event) => actionMenu.value.toggle(event)
const remoteProfileActions = computed(() => { return [
  profile.value.user_following ? {label: $gettext('Unfollow'), icon: "pi pi-minus text-blue-500", command: () => followChange(uuid, false)}
      : {label: $gettext('Follow'), icon: "pi pi-plus text-blue-500", command: () => followChange(uuid, true)},
  {label: $gettext('Bookmark'), icon: "pi pi-star text-blue-500", command: notImplemented},
  {label: $gettext('Message'), icon: "pi pi-envelope text-blue-500", command: () => setEditorProps({mode: 'create', recipient: `@${profile.value.finger}`})},
  {label: $gettext('Hide'), icon: "pi pi-eye text-blue-500", command: notImplemented},
  {label: $gettext('Block'), icon: "pi pi-minus text-blue-500", command: notImplemented}
]})

let hasChanges = ref(false)

const avatarPanelIsVisible = ref(false)
const avatarInfo = ref({
  url: profile.value.avatar_url,
  description: '',
  type: '',
  accept: 'image/*',
  category: 'avatars'
})
const toggleAvatarPanel = () => avatarPanelIsVisible.value = !avatarPanelIsVisible.value
const setAvatar = (info) => {
  console.log('avatar', info)
  hasChanges.value = true
  profiles.value[uuid].avatar_url = info.url
  updates.avatar_url = info.url
  Object.assign(avatarInfo.value, info)
  avatarPanelIsVisible.value = false
}

const picturePanelIsVisible = ref(false)
const pictureInfo = ref({
  url: profile.value.picture_url,
  description: '',
  type: '',
  accept: 'image/*',
  category: 'pictures'
})
const togglePicturePanel = () => picturePanelIsVisible.value = !picturePanelIsVisible.value
const setPicture = (info) => {
  hasChanges.value = true
  profiles.value[uuid].picture_url = info.url
  updates.picture_url = info.url
  Object.assign(pictureInfo.value, info)
  picturePanelIsVisible.value = false
}


const namePanel = ref()
const toggleNamePanel = (event) => namePanel.value.toggle(event)
const profileName = ref(profile.value.name)
const setName = () => {
  if (profileName.value !== profile.value.name) {
    hasChanges.value = true
    profiles.value[uuid].name = profileName.value
    updates.name = profileName.value
  }
  namePanel.value.hide()
}

const editor = ref(null)
const createEditor = () => {
  editor.value = new Editor({
    autofocus: "end",
    content: `${profile.value.bio}`,
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      Markdown,
    ],
    editorProps: {
      attributes: {
        class: "max-h-96 w-max p-2 overflow-y-auto overscroll-contain text-sm rounded"
      },
    },
  })
}

const bioPanel = ref()
const toggleBioPanel = (event) => {
  createEditor()
  bioPanel.value.toggle(event)
}
const setBio = () => {
  const text = editor.value?.getHTML()
  console.log('setBio', text, profile.value.bio)
  if (text !== profile.value.bio) {
    hasChanges.value = true
    updates.bio = text
    profiles.value[uuid].bio = text
  }
  editor.value?.destroy()
  editor.value = null
  bioPanel.value.hide()
}



let updates = {}
const committingChanges = ref(false)
const commitChanges = async () => {
  console.log('updates', updates)
  committingChanges.value = true
  const errorMessage = await updateProfile(uuid, updates)
  committingChanges.value = false
  if (!errorMessage) {
    hasChanges.value = false
    updates = {}
  }
}

const rejectChanges = () => {
  hasChanges.value = false
  updates = {}
}

onUpdated(() => {
  console.log('profile editor updated')
  avatarInfo.value.url = profiles.value[uuid].avatar_url
  pictureInfo.value.url = profiles.value[uuid].picture_url
})

onActivated(() => {
  console.log('profile editor activated')
  avatarInfo.value.url = profiles.value[uuid].avatar_url
  pictureInfo.value.url = profiles.value[uuid].picture_url

})

defineExpose({hasChanges, commitChanges, rejectChanges})
</script>


<template>
  <Panel toggleable
         :header="isAuthenticatedUser(uuid) ? __('Profile editor') : __('Profile info')"
         :pt="{title: 'font-medium'}">
    <div class="relative flex h-24 w-full justify-center md:h-96">
      <img :src="profile.picture_url" class="w-full overflow-y-clip rounded object-cover object-center"/>
      <Button v-if="isAuthenticatedUser(uuid)"
              :title="__('Modify picture')"
              size="small"
              icon="pi pi-pencil" text
              @click="togglePicturePanel"
              class="absolute bottom-0 right-0 bg-stone-700/50 text-white md:bottom-4 md:right-4" />
      <Button v-if="hasChanges"
              icon="pi pi-save" text
              :label="__('Save changes')"
              @click="commitChanges"
              :loading="committingChanges"
              class="absolute bottom-0 left-1/2 z-10 bg-stone-700/50 text-white md:bottom-2"
      />
      <div class="absolute top-2 flex h-3/4 w-10/12 flex-row rounded bg-stone-700/80 text-stone-200 md:top-12">
        <div class="hidden w-full flex-col p-3 md:ml-8 md:flex">
          <div class="flex">
            <span class="text-sm font-bold md:text-xl">{{ profile.name }}</span>
            <Button v-if="isAuthenticatedUser(uuid)" :title="__('Modify name')" @click="toggleNamePanel"
                    size="small" icon="pi pi-pencil" text class="bg-stone-700/50 text-xs text-white" />
          </div>
          <span v-if="profile.is_local" class="text-xs text-stone-300">@{{ profile.finger }}</span>
          <a v-else :href="profile.home_url" :title="profile.home_url" rel="nofollow" target="_blank" class="text-xs text-stone-300">@{{ profile.finger }}</a>
          <div class="mt-2 flex">
            <div class="relative size-32">
              <img :src="profile.avatar_url" class="h-full max-w-none rounded-lg opacity-100" />
              <Button v-if="isAuthenticatedUser(uuid)" :title="__('Modify avatar')" @click="toggleAvatarPanel"
                      size="small" icon="pi pi-pencil" text class="absolute bottom-0 right-0 bg-stone-700/50 text-xs text-white" />
            </div>
            <div class="ml-24 flex">
              <Button v-if="isAuthenticatedUser(uuid)" :title="__('Modify bio')" @click="toggleBioPanel"
                      size="small" icon="pi pi-pencil" text class="h-min bg-stone-700/50 text-xs text-white" />
              <span class="hidden h-24 max-w-none overflow-y-auto overscroll-contain text-xs text-stone-200 md:inline md:h-48" v-html="profile.bio ?? 'No bio'" />
            </div>
          </div>
        </div>
        <!-- Mobile view -->
        <div class="flex w-full md:hidden">
          <div class="relative size-16">
            <img :src="profile.avatar_url" class="m-1 h-full max-w-none rounded-lg opacity-100" />
            <Button v-if="isAuthenticatedUser(uuid)" :title="__('Modify avatar')" size="small" @click="toggleAvatarPanel" :pt="{root: 'size-fit p-0'}"
                    icon="pi pi-pencil" text class="absolute bottom-0 right-0 bg-stone-700/50 text-xs text-white" />
          </div>
          <div class="ml-4 grid grid-flow-row auto-rows-min justify-items-start py-1">
            <div class="flex">
              <span class="text-sm font-medium">{{ profile.name }}</span>
              <Button v-if="isAuthenticatedUser(uuid)" :title="__('Modify name')" @click="toggleNamePanel" :pt="{root: 'size-fit p-0'}"
                      size="small" icon="pi pi-pencil" text class="bg-stone-700/50 text-xs text-white" />
            </div>
            <span v-if="profile.is_local" class="text-xs text-stone-300">@{{ profile.finger }}</span>
            <a v-else :href="profile.home_url" :title="profile.home_url" rel="nofollow" target="_blank" class="text-xs text-stone-300">@{{ profile.finger }}</a>
          </div>
        </div>
        <Button v-if="!isAuthenticatedUser(uuid) && userIsAuthenticated" text
                @click="toggleActions" id="overlay_menu" aria-haspopup="true" aria-controls="overlay_menu"
                class="right-0 top-0 h-min text-white" size="small"
                icon="pi pi-ellipsis-v" :pt="{root: 'size-fit p-0'}" />
        <Menu ref="actionMenu" popup :model="remoteProfileActions"
              class="min-w-max border-none bg-stone-700 font-medium"
              :pt="{itemContent: 'text-white text-sm hover:text-stone-700'}"
        />
      </div>
    </div>
    <div class="flex rounded bg-stone-700 p-2 md:hidden">
      <Button v-if="isAuthenticatedUser(uuid)" title="Modify bio" @click="toggleBioPanel"
              size="small" :pt="{icon: 'size-4'}"
              icon="pi pi-pencil" text class="h-min bg-stone-700/50 text-xs text-white md:hidden" />
    <span class="max-h-24 max-w-none overflow-y-auto overscroll-contain text-xs text-stone-200"
      v-html="profile.bio || __('No bio')" />
    </div>
  </Panel>
  <UploadMedia v-model:visible="avatarPanelIsVisible" :info="avatarInfo"
               :title="__('Update avatar')"
               @media-uploaded="setAvatar"
               :uploadOnly="true"
               :cropperOptions="{canvas: {height: 300, width: 300}, stencilProps: {aspectRatio: 1}}"
  />
  <UploadMedia v-model:visible="picturePanelIsVisible" :info="pictureInfo"
               @media-uploaded="setPicture" :uploadOnly="true"
               :title="__('Update profile picture')"
  />
  <Popover ref="namePanel">
    <form @submit="setName" method="dialog" class="flex">
      <InputText v-model.lazy.trim="profileName" />
      <Button text type="submit" :label="__('Update')" />
    </form>
  </Popover>
  <Popover ref="bioPanel">
    <form @submit="setBio" method="dialog">
      <div class="flex flex-col items-center">
        <editor-content :editor="editor" class="bg-white"/>
        <Button text type="submit" :label="__('Update')" class="w-min"/>
      </div>
    </form>
  </Popover>
</template>
