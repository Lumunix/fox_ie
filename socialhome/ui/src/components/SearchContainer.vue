<script setup>
import {computed, ref} from 'vue'
import { useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { apiFetch } from "@/helpers/utils"
import { useAuthStore } from "@/stores/auth"
import { useContentsStore} from "@/stores/contents"
import { Button, InputGroup, InputGroupAddon, InputText, Popover } from "primevue"
import { vInfiniteScroll } from '@vueuse/components'
import {useToast} from "primevue/usetoast"
import {useGettext} from "vue3-gettext"
import ponyUrl from '@/assets/pony100.png'

const router = useRouter()
const toast = useToast()
const { $gettext } = useGettext()
const searchQuery = ref()
const authStore = useAuthStore()
const CSRFToken = computed(() => {return authStore.CSRFToken})
const { isFetching } = storeToRefs(useContentsStore())
const searchPanel = ref()
const searchResults = ref([])
const nextPage = ref()
const noMoreData = ref(false)
const queryUrl = computed(() => {
  const value = nextPage.value ?? (!noMoreData.value ? `/api/search/?name__startswith=${encodeURIComponent(searchQuery.value)}`: undefined)
  console.log('computed', nextPage.value, value)
  return value
})

defineOptions({
  inheritAttrs: false,
  customOptions: {},
})
const emit = defineEmits(['hide'])

const getSearchResults = async () => {
  isFetching.value = true
  const { errorMessage } = await apiFetch(queryUrl.value,
      {
        headers: {'X-CSRFToken': CSRFToken.value},
        credentials: 'include'
      }, (payload) => {
        if (payload.count === 0) {
          toast.add({severity: 'warn', summary: 'Search', detail: 'No matching results!', life: 5000})
          hideSearchResults()
        } else if (payload.count === 1) {
          const result = payload.results[0]
          if (Object.hasOwn(result, 'finger')) router.push({name: 'profile-all', params: {uuid: result.uuid}})
          else if (Object.hasOwn(result, 'id')) router.push({name: 'content', params: {id: result.id}})
          else router.push({name: 'tag', params: {tagName: result.name}})
          hideSearchResults()
        } else {
          nextPage.value = payload.next
          console.log('nextPage', nextPage.value)
          searchResults.value = searchResults.value.concat(payload.results)
          if (searchResults.value.length >= payload.count) noMoreData.value = true
          console.log('searchResults', searchResults.value)
        }
      })
  if (errorMessage) toast.add({severity: 'error', summary: $gettext('Search Error'), detail: errorMessage, life: 5000})
  isFetching.value = false
}

const onLoadMore = async () => {
  if (!queryUrl.value || noMoreData.value) return
  await getSearchResults()
}

const showSearchResults = async (event) => {
  if (searchQuery.value) {
    clearSearch()
    await getSearchResults() // why does this clear event.currentTarget?
    if (searchResults.value.length > 1) searchPanel.value.show(event, event.target)
  }
}

const hideSearchResults = () => {
  searchQuery.value = undefined
  searchPanel.value.hide()
  emit('hide')
}

const clearSearch = () => {
  //searchQuery.value = undefined
  nextPage.value = undefined
  searchResults.value = []
  noMoreData.value = false
}

const handleIconError = (evt, item) => {
  evt.target.src = ponyUrl
  item.avatar_url = ponyUrl
}

</script>

<template>
  <div class="flex">
  <form @submit="showSearchResults" method="dialog">
    <InputGroup class="h-8">
      <InputText v-model.lazy.trim="searchQuery" :placeholder="__('Search')" class="border-none bg-black text-white placeholder:italic" fluid/>
      <InputGroupAddon class="border-none !bg-black">
        <Button small icon="pi pi-search" class="!px-5 !py-1 !text-white" text
                :disabled="!!searchResults.length" type="submit" />
      </InputGroupAddon>
    </InputGroup>
  <Popover ref="searchPanel" @hide="clearSearch" >
    <div class="size-72 overflow-y-auto overscroll-contain rounded border border-surface-200 dark:border-surface-700">
      <div v-for="(item, idx) in searchResults" :key="item">
        <div v-infinite-scroll="[onLoadMore, {canLoadMore: () => idx === searchResults.length - 5 && !noMoreData}]" />
        <div v-if="item?.finger ?? item?.avatar_url">
          <router-link @click="hideSearchResults"
                       :to="{name: 'profile-all', params:{uuid: item.uuid}}"
                       class="flex space-x-4 p-1 shadow-md hover:bg-stone-200">
            <img :src="item?.avatar_url" class="float-left size-8 rounded-lg" @error="handleIconError($event, item)"/>
            <div class="grid grid-cols-1 justify-items-start">
              <span v-html="item?.name" class="text-sm"/>
              <span class="text-xs italic">{{item?.finger}}</span>
            </div>
          </router-link>
        </div>
        <div v-else-if="item?.name">
          <router-link @click="hideSearchResults"
                       :to="{name: 'tag', params: {tagName: item.name}}"
                       class="flex justify-center space-x-4 p-1 shadow-md hover:bg-stone-200">
            <span>#{{item.name}}</span>
          </router-link>
        </div>
      </div>
    </div>
  </Popover>
  </form>
  </div>
</template>
