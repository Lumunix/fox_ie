<script setup>
import { computed, onActivated, ref } from "vue"
import { useRoute} from "vue-router"
import { storeToRefs } from "pinia"
import { useContentsStore } from "@/stores/contents"
import { useProfilesStore} from "@/stores/profiles"
import { vInfiniteScroll } from '@vueuse/components'
import {Button, Checkbox, InputGroup, InputGroupAddon, InputText} from "primevue"
import { useConfirm } from "primevue/useconfirm"
import { useGettext } from "vue3-gettext"
import ponyUrl from "@/assets/pony100.png"

defineOptions({
  inheritAttrs: false,
  customOptions: {},
})

const route = useRoute()
const confirm = useConfirm()
const { $gettext } = useGettext()
const { isFetching } = storeToRefs(useContentsStore())
const { profiles } = storeToRefs(useProfilesStore())
const { fetchContacts, followChange } = useProfilesStore()
const contactType = ref(route.name.split('-')[1])
const contacts = computed(() => profiles.value[route.params.uuid][contactType.value])
const noMoreData = computed(() => !contacts.value?.next)
const selectedContacts = ref([])
console.log('contact container', contacts.value)

const isLoading = ref(false)
const filteredUuids = ref(contacts.value.list)
const uuidFilter = ref()
const filterIsApplied = ref(false)
const toggleUuidFilter = () => {
  filterIsApplied.value = !filterIsApplied.value
  isLoading.value = true
  if (!filterIsApplied.value && filteredUuids.value.length < contacts.value.list.length)
    filteredUuids.value = contacts.value.list
  applyUuidFilter()
}

const applyUuidFilter = (event) => {
  console.log('contact filter', uuidFilter.value)
  if (event?.key === 'Enter') filterIsApplied.value = true
  if (!event || event?.key === 'Enter') {
    isLoading.value = true
    if (uuidFilter.value && filterIsApplied.value) filterUuids()
    isLoading.value = false

  }
}

const filterUuids = () => {
  filteredUuids.value = [...contacts.value.list.filter((uuid) => {
    const profile = profiles.value[uuid]
    const re = new RegExp(`.*${uuidFilter.value}.*`, 'i')
    return profile.name?.match(re) || profile.finger?.match(re)
  })]
  console.log('filtered uuids', filteredUuids)
}
const onLoadMore = async () => {
  console.log('load more contacts', filteredUuids.value.length, filterIsApplied.value, noMoreData.value)
  if (isLoading.value) return
  isLoading.value = true
  await fetchContacts(contactType.value, route.params.uuid)
  if (filterIsApplied.value) filterUuids()
  else filteredUuids.value = contacts.value.list
  if (allChecked.value) selectedContacts.value = [...filteredUuids.value]
  isLoading.value = false
}

const allChecked = ref(false)
const partialSelection = computed(()  => selectedContacts.value.length > 0 && selectedContacts.value.length < filteredUuids.value.length)
const selectAll = () => {
  console.log('selected contacts', allChecked.value, selectedContacts.value)
  if (partialSelection.value) {
    selectedContacts.value = []
    allChecked.value = false
} else {
    allChecked.value = !allChecked.value
    selectedContacts.value = allChecked.value ? [...filteredUuids.value] : []
  }
  console.log('selected contacts after', allChecked.value, selectedContacts.value)
}

const unfollowing = ref(false)
const unfollowContacts = async () => {
  unfollowing.value = true
  console.log('unfollowing', selectedContacts)
  for (let i=0; i < selectedContacts.value.length; i++) {
    let uuid = selectedContacts.value[i]
    await followChange(uuid, false)
    contacts.value.list.splice(contacts.value.list.indexOf(uuid), 1)
    filteredUuids.value.splice(filteredUuids.value.indexOf(uuid), 1)
  }
  unfollowing.value = false
}

const confirmUnfollow = () => {
  confirm.require({
    message: $gettext('Unfollow %{ num } contacts?', {num: selectedContacts.value.length}),
    header: $gettext('Contact manager'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: $gettext('Ignore'),
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: $gettext('Proceed'),
    },
    accept: () => {
      unfollowContacts()
    },
  })
}

onActivated(() => {
  isFetching.value = false
  onLoadMore()
})

const handleIconError = (evt) => {
  evt.target.src = ponyUrl
  //requestProfileUpdate(props.uuid)
}
</script>

<template>
  <div class="m-2 flex flex-col items-center space-x-4 rounded bg-stone-100 md:flex-row">
    <div class="flex h-12 flex-row items-center space-x-4">
      <button @click="selectAll"
              class="ml-4 size-5 items-center border border-stone-300 bg-stone-50 shadow-sm hover:border-surface-400">
        <v-icon v-if="partialSelection" name="hi-solid-minus" class="mb-1 text-stone-700" />
        <v-icon v-else-if="selectedContacts.length === filteredUuids.length" name="hi-check" class="mb-1 text-stone-700" />
      </button>
      <InputGroup class="h-8 w-fit bg-stone-100 shadow">
        <InputText v-model.lazy.trim="uuidFilter" @keyup="applyUuidFilter"
                   :placeholder="__('Filter')" class="border-none placeholder:italic" fluid/>
        <InputGroupAddon class="border-none">
          <Button small :icon="filterIsApplied ? 'pi pi-filter-fill' : 'pi pi-filter'" class="!px-5 !py-1 text-slate-700" text
                  :title="filterIsApplied ? __('Disable filter'): __('Activate filter')" @click="toggleUuidFilter" :loading="isLoading"/>
        </InputGroupAddon>
      </InputGroup>
    </div>
    <div v-if="contactType === 'following' && selectedContacts.length > 0">
      <Button :label="__('Unfollow selected profiles')" icon="pi pi-user-minus" text
              @click="confirmUnfollow" :loading="unfollowing"
      />
    </div>
  </div>
  <div v-if="contacts?.list">
    <div class="grid grid-cols-1 gap-4 rounded p-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4">
      <div v-for="(uuid, idx) in filteredUuids" :key="uuid" >
        <div class="flex items-center rounded bg-stone-100 p-4 text-stone-700">
          <div v-infinite-scroll="[onLoadMore, {canLoadMore: () => (idx === filteredUuids.length - 1 || filterIsApplied) && !noMoreData}]" />
          <checkbox v-model="selectedContacts" :value="uuid" class="mr-4"/>
          <img
              class="size-12 rounded-lg" @error="handleIconError($event)"
              alt="Profile icon"
              :src="profiles[uuid].avatar_url" />
          <router-link :to="{name: 'profile-all', params: {uuid: uuid}}"
                       class="grid h-min grid-cols-1 justify-items-start truncate pl-2">
            <span class="font-medium" v-html="profiles[uuid].name" />
            <span class="text-xs">@{{profiles[uuid].finger}}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>