<script setup>
import { onBeforeRouteUpdate } from "vue-router"
import { useContentsStore } from '@/stores/contents'
import { useGettext } from "vue3-gettext"
import StreamContainer from "@/components/StreamContainer.vue"

defineProps(['tagName'])
const { updateStream } = useContentsStore()
const { $gettext } = useGettext()

onBeforeRouteUpdate(async (to) => {
  await updateStream(to, {apiEndpoint: `streams/tag/${to.params.tagName}`,
    name: `#${to.params.tagName}`,
    title: $gettext('Posts tagged with #%{ tag }', {tag: to.params.tagName})
  })
})
</script>

<template>
  <StreamContainer streamName="tag" />
</template>
