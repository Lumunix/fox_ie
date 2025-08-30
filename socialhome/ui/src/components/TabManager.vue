<template>
  <div class="md:px-0">
    <TabGroup :selected-index="currentTabIndex">
      <div class="z-10 flex bg-stone-200 text-stone-700">
        <TabList class="hidden w-min pl-12 text-sm md:flex md:text-base">
          <Tab
            v-for="(stream, name) in streams"
            as="div"
            :key="name"
            v-slot="{ selected }"
          >
            <router-link
              v-if="isAvailable(name)"
              :to="getStreamRoute(name)"
              :title="stream.title"
              :class="['px-2 text-stone-700 hover:bg-stone-300 hover:text-black',
                selected
                  ? 'border-b-4 border-emerald-600'
                  : '',
                'flex space-x-0.5 p-2 font-medium',
              ]"
              :aria-current="selected ? 'page' : undefined"
            >
              <i :class="[stream.icon, 'pt-1']" />

              <span class="whitespace-nowrap">{{ stream.name }}</span>
            </router-link>
          </Tab>
        </TabList>
        <div class="flex w-full items-center justify-end pr-6">
          <button
            @click="
              verticalPosition = 0;
              onNewContent();
            "
            :class="[
              hasMore ? 'text-blue-700' : '',
              'w-auto px-2 py-2.5 italic sm:px-4 sm:text-right',
            ]"
            :title="hasMore ? `${hasMore} ${_x('new post', 'new posts', hasMore ?? 0)}` : ''"
          >
            {{ streamTitle + (hasMore ? ` (${hasMore} ${_x('new', 'new', hasMore ?? 0)})` : '')}}
          </button>
          <Button v-if="canFollowTags"
                  @click="followTag"
                  :title="tagIsFollowed ? __('Unfollow tag') : __('Follow tag')"
                  :icon="tagFollowButtonIcon"
                  class="!text-emerald-600" variant="outlined" />
          <Button
            variant="outlined"
            @click="toggleColumns"
            :title="singleColumn ? __('Toggle grid view') : __('Toggle single column view')"
          >
            <Squares2X2Icon
              v-if="singleColumn"
              class="hidden h-5 w-5 text-blue-500 md:inline-block"
            />
            <Bars2Icon
              v-else
              class="hidden h-5 w-5 text-blue-500 md:inline-block"
            />
          </Button>
        </div>
      </div>
    </TabGroup>
  </div>
    <div ref="tabElement" :class="['px-2 pt-3 sm:px-12 overflow-y-scroll overscroll-y-contain', singleColumn ? 'md:px-48' : '']">
      <router-view v-slot="{ Component }" >
        <keep-alive :max="5000">
          <component :is="Component" :key="streamName" :streamName="streamName"/>
        </keep-alive>
      </router-view>
    </div>
</template>

<script setup>
import {computed, onUpdated, provide, ref, watch} from "vue";
import { TabGroup, TabList, Tab } from "@headlessui/vue";
import { Bars2Icon, Squares2X2Icon } from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { useContentsStore } from "@/stores/contents";
import { useRoute } from "vue-router";
import { useScroll } from "@vueuse/core";
import {useWebSocket} from "@vueuse/core";
import {useProfilesStore} from "@/stores/profiles";
import {useAuthStore} from "@/stores/auth";
import Button from "primevue/button";

const route = useRoute();

const tabElement = ref()
const { y: verticalPosition } = useScroll(tabElement, { behaviour: "smooth" });
const updateVerticalPosition = (position) => verticalPosition.value = position
provide('verticalPosition', {
  verticalPosition,
  updateVerticalPosition
})

const { singleColumn, streams } = storeToRefs(useContentsStore());
const { getNewContentCount, getStreamRoute, isAvailable, onNewContent, setUnfetchedContent } = useContentsStore();
const { followedTags, userIsAuthenticated } = storeToRefs(useAuthStore())
const { tagFollowChange } = useAuthStore()
const { profiles } = storeToRefs(useProfilesStore())
const { fetchProfile } = useProfilesStore()
const streamName = computed((oldValue) => {
  return streams.value[route.name] ? route.name : oldValue ?? 'public'
} )
const currentStream = computed(() => streams.value[streamName.value])
const streamTitle = computed(() => streams.value[streamName.value].title ?? '')
const currentTabIndex = computed(() => Object.keys(streams.value).indexOf(streamName.value))
const hasMore = computed(() => currentStream.value.unfetched.length)
const toggleColumns = () => (singleColumn.value = !singleColumn.value);

const currentWsUrl = computed((oldTarget) => {
  console.log('wsUrl', oldTarget, currentStream.value?.notifyKey)
  if (currentStream.value === undefined || currentStream.value.notifyKey === undefined) {
    return oldTarget
  }
  let target = `wss://${window.location.host}/ch/${currentStream.value.notifyKey}/`
  return oldTarget === target ? oldTarget : target
})

let lastWsConnection = Date.now()
let lastWsUrl = undefined
const { data, status } = useWebSocket(currentWsUrl, {
    autoReconnect: true,
    heartbeat: {
      interval: 60000,
      message: JSON.stringify({event: 'ping'}),
      pongTimeout: 2000,
      responseMessage: JSON.stringify({event: 'pong'})
    },
    onConnected: async (ws) => {
      let connectionTime = Date.now()
      console.log('connect', connectionTime, status.value, ws.readyState)
      // if same url, do not fetch data if reconnect is within 10 seconds
      // if not same url, data fetch will be called at relevant component mount/activation
      if (lastWsUrl === currentWsUrl.value) {
        if ((connectionTime - lastWsConnection) > 10000) getNewContentCount()
      }
      lastWsConnection = connectionTime
      lastWsUrl = currentWsUrl.value
    },
    onDisconnected: (w, event) => {
      console.log('disconnect', Date.now(), status.value, w.url, w.readyState, event.wasClean)
      //if (ws.value && ws.value.url !== w.url) status.value = 'OPEN'
    },
    onError: (ws, event) => console.log('error', event)
  })

onUpdated(() => console.log('tabs', streamName.value, currentStream.value.name, currentStream.value.title))

watch(
  data,
    (newNotification) => {
      const notif = JSON.parse(newNotification)
      console.log('notification', notif)
      if (notif.event === 'new') {
       setUnfetchedContent(notif)
      } else if (notif.event === 'profile') {
        // only update profiles we already fetched
        if (profiles.value[notif.uuid]) {
          fetchProfile(notif.uuid)
        }
      } else {
        console.log(`${notif.event} is unimplemented`)
      }
    }
)

const canFollowTags = computed(() => userIsAuthenticated.value && streamName.value === 'tag')
const tagIsFollowed = computed(() => followedTags.value.includes(currentStream.value?.params?.tagName))
const tagFollowButtonIcon = computed(() =>
    tagIsFollowed.value ? 'pi pi-minus' : 'pi pi-plus')
const followTag = () => tagFollowChange(currentStream.value?.params?.tagName, currentStream.value?.tagUuid)
</script>

