<script setup>
import StreamElement from "@/components/StreamElement.vue"
import { useContentsStore } from "@/stores/contents"
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { computed, inject, onActivated, onDeactivated, onUpdated, nextTick, ref, watch } from "vue"
import {storeToRefs} from "pinia"
import { useGettext } from "vue3-gettext"
import { useElementBounding } from '@vueuse/core'

const props = defineProps(['id'])
const route = useRoute()
const { verticalPosition, updateVerticalPosition } = inject('verticalPosition')
const { $gettext } = useGettext()
const { getContent, getReplies, updateStream } = useContentsStore()
const { contents, streams } = storeToRefs(useContentsStore())
const post = computed(() => streams.value['content'].index.length ? contents.value[props.id] : undefined)
const apiEndpoint = computed(() => `content/${props.id}`)
const scrollTo = ref()
const { top } = useElementBounding(scrollTo)

onBeforeRouteUpdate(async (to, from) => {
  const { content } = await getContent(to.params.id)
  if (from.name === 'content' && content.id.toString() === from.params.id) return false
  const error = await updateStream(to, {apiEndpoint: apiEndpoint.value, name: $gettext('Single Content'), title: ''})
  if (error) return false
  await getReplies(content.id, true)
  scrollTo.value =  to.hash ? document.getElementById(to.hash.substring(1)) : undefined
  console.log('onBeforeRouteUpdate single content', to, scrollTo.value, top, to.hash)
})

let lastScrollPosition = 0
onActivated(async () => {
  if (contents.value[props.id].replyIds.length === 0) await getReplies(props.id, true)
  scrollTo.value =  route.hash ? document.getElementById(route.hash.substring(1)) : undefined
  console.log('onActivated single content', route, scrollTo.value, top, route.hash)
  updateVerticalPosition(top.value ?? lastScrollPosition)
})

onDeactivated(() => lastScrollPosition = verticalPosition.value)
</script>

<template>
  <div
      :class="[
              'mx-1 mt-3 sm:mx-12 md:mx-48',
              'ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none',
            ]"
  >
    <div v-if="post" class="overflow-x-auto overscroll-x-auto rounded bg-stone-100 shadow-md">
      <StreamElement :postId="id" :singleContent="true" streamName="content" />
    </div>
  </div>
</template>
