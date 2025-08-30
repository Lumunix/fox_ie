<script setup>
import { computed, onUpdated, ref } from "vue";
import {onBeforeRouteLeave, onBeforeRouteUpdate, useRouter} from "vue-router"
import { useContentsStore} from "@/stores/contents"
import { useProfilesStore } from "@/stores/profiles"
import { useAuthStore} from "@/stores/auth"
import {storeToRefs} from "pinia";
import { Button, Tabs, TabList, Tab } from 'primevue'
import { useConfirm } from "primevue/useconfirm"
import { useGettext } from "vue3-gettext"
import ProfileEditor from "@/components/ProfileEditor.vue"

defineOptions({
  inheritAttrs: false,
  customOptions: {},
})

const { uuid } = defineProps(['uuid'])
const router = useRouter()
const confirm = useConfirm()
const { $gettext } = useGettext()
const { isAuthenticatedUser } = useAuthStore()
const { profiles } = storeToRefs(useProfilesStore())
const { fetchContacts, fetchProfile } = useProfilesStore()
const { hasContent, updateStream } = useContentsStore()
const profile = computed(() => profiles.value[uuid] ?? {})
const streamName = ref(router.currentRoute.value.name)
console.log('streamName setup', streamName, router.currentRoute.value.name)
const tabChange = (value) => {
  console.log('tab change', value, streamName, router.currentRoute.value.name)
  //streamName.value = value
}

onUpdated(() => {
  console.log('onUpdated profile', streamName, router.currentRoute.value.name)
  if (router.currentRoute.value.name.startsWith('profile')) streamName.value = router.currentRoute.value.name
})

const streamContainer = ref()
const profileEditor = ref()
const hasChanges = computed(() => profileEditor.value.hasChanges || streamContainer.value.hasChanges)
const draggable = ref(false)
const reorderLabel = computed(() => streamContainer.value?.hasChanges ? $gettext('Save order') : $gettext('Reorder'))

const toggleDragging = () => {
  draggable.value = !draggable.value
  if (!draggable.value && streamContainer.value.hasChanges) streamContainer.value.commitChanges()
}

const commitChanges = async () => {
  await profileEditor.value.commitChanges()
  streamContainer.value.commitChanges()
}

const rejectChanges = () => {
  profileEditor.value.rejectChanges()
  streamContainer.value.rejectChanges()
  if (routeTo) router.push(routeTo)
  routeTo = undefined
}

let routeTo = undefined
const confirmUpdates = () => {
  confirm.require({
    message: $gettext('You have unsaved changes'),
    header: $gettext('Profile editor'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: $gettext('Ignore'),
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: $gettext('Save'),
    },
    accept: () => {
      commitChanges()
    },
    reject: () => {
      rejectChanges()
    },
  })
}

const routeUpdate = (to) => {
  console.log('routeUpdate', profileEditor.value.hasChanges, streamContainer.value.hasChanges)
  if (hasChanges.value) {
    routeTo = to
    confirmUpdates()
    return false
  }
}
onBeforeRouteUpdate( async (to) => {
  console.log('before profile route update', to.params.uuid)
  if (routeUpdate(to) === false) return false
  draggable.value = false
  const { error, profile } = await fetchProfile(to.params.uuid)
  console.log('profile view update', profile, uuid, to)
  if (error) return false
  if (!profile.is_local && to.name === 'profile-pinned')
    return {name: 'profile-all', params: {uuid: profile.uuid}}
  if (to.meta?.contacts && isAuthenticatedUser(to.params.uuid)) {
    const contactsError = await fetchContacts(to.name.split('-')[1], to.params.uuid)
    if (contactsError) return false
  }
  const apiEndpoint = `streams/${to.name}/${to.params.uuid}`
  const title = $gettext('Posts from %{ name }', {name: profile?.name ?? profile?.finger})
  if (hasContent(to.name)) {
    updateStream(to, {apiEndpoint, title})
  } else {
    const errorMessage = await updateStream(to, {apiEndpoint, title})
    if (errorMessage) return false
  }

})
onBeforeRouteLeave( (to) => {
  console.log('before leave', to, routeUpdate(to))
  draggable.value = false
  return routeUpdate(to)
})
</script>

<template>
  <ProfileEditor ref="profileEditor" v-if="profile" :uuid="uuid" />
  <div class="flex max-w-min">
    <Tabs v-model:value="streamName" @update:value="tabChange" scrollable :pt="{root: 'w-screen'}">
      <TabList :pt="{activeBar: 'z-0 border-b-4 border-emerald-600', tabList: 'bg-inherit rounded'}">
        <Tab value="profile-pinned" as="div" :disabled="!profile.is_local"
             :pt="{root: 'text-stone-700 font-medium hover:bg-stone-300/80'}">
          <router-link :to="{name: 'profile-pinned', params: {uuid: uuid}}">
            {{ __('Pinned posts') }}
          </router-link>
        </Tab>
        <Tab value="profile-all" as="div" :pt="{root: 'text-stone-700 font-medium hover:bg-stone-300/80'}">
          <router-link :to="{name: 'profile-all', params: {uuid: uuid}}">
            {{ __('All posts') }}
          </router-link>
        </Tab>
        <Tab value="profile-following" as="div" :disabled="!isAuthenticatedUser(uuid)"
             :pt="{root: 'text-stone-700 font-medium hover:bg-stone-300/80'}">
          <router-link :to="{name: 'profile-following', params: {uuid: uuid}}">
            {{ __('Following') }}
          </router-link>
        </Tab>
        <Tab value="profile-followers" as="div" :disabled="!isAuthenticatedUser(uuid)"
             :pt="{root: 'text-stone-700 font-medium hover:bg-stone-300/80'}">
          <router-link :to="{name: 'profile-followers', params: {uuid: uuid}}">
            {{ __('Followers') }}
          </router-link>
        </Tab>
      </TabList>
    </Tabs>
    <Button v-if="streamName === 'profile-pinned' && isAuthenticatedUser(uuid)"
            text class="hidden justify-self-end whitespace-nowrap md:inline-flex" :label="reorderLabel" @click="toggleDragging"
            icon="pi pi-sort-alt" :loading="draggable && !streamContainer?.hasChanges"
    />
  </div>
  <div class="my-2 !p-0">
    <router-view v-slot="{Component}" :name="streamName.split('-')[1]">
      <keep-alive>
        <component ref="streamContainer" :is="Component" :draggable="draggable" :streamName="streamName" :key="streamName"/>
      </keep-alive>
    </router-view>
  </div>
</template>
