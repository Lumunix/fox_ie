<script setup>

import {
  computed,
  inject,
  nextTick,
  onActivated,
  onDeactivated,
  onUnmounted, onUpdated,
  shallowRef,
  ref,
} from "vue"
import { useContentsStore } from "@/stores/contents"
import { useProfilesStore } from "@/stores/profiles"
import {storeToRefs} from "pinia";
import StreamElement from "@/components/StreamElement.vue"
import MasonrySupported from "@/helpers/MasonrySupported.vue"
import MasonryNotSupported from "@/helpers/MasonryNotSupported.vue"

const { draggable, streamName } = defineProps(['draggable', 'streamName'])
const { verticalPosition, updateVerticalPosition } = inject('verticalPosition')
const { isFetching, singleColumn, streams } = storeToRefs(useContentsStore());
const { reorderProfile } = useProfilesStore()
const stream = computed(() => streams.value[streamName] ?? streams.value['public'])
const fullStreamIndex = computed(() => stream.value.index)
const lastIndex = computed(() => stream.value.index.indexOf(stream.value.lastIds[0]) + 1)
const streamIndex = computed(() => fullStreamIndex.value.slice(0, lastIndex.value))

const hasChanges = ref(false)

const masonryIsSupported = window.CSS.supports("grid-template-rows", "masonry") 
const masonryComponent = shallowRef(
  masonryIsSupported ? MasonrySupported : MasonryNotSupported
);

let lastScrollPosition = 0
onActivated(() => {
  updateVerticalPosition(lastScrollPosition)
  console.log('stream container activated', lastScrollPosition)
  isFetching.value = false
})
onDeactivated(() => {
  lastScrollPosition = verticalPosition.value
  console.log('stream container deactivated', lastScrollPosition)
})
onUpdated(() => {
  isFetching.value = false
  // content ids falling off the partial index will be re-rendered
})
onUnmounted(() => console.log('unmounted', stream.value.name))

const dragging = ref(false)
const startDrag = (evt, pos) => {
  dragging.value = true
  console.log('start drag', stream.value.index, pos)
  evt.dataTransfer.dropEffect = 'move'
  evt.dataTransfer.effectAllowed = 'move'
  evt.dataTransfer.setData('startPos', pos)
}

const onDrop = (evt, pos) => {
  const startPos = parseInt(evt.dataTransfer.getData('startPos'), 10)
  console.log('before drop', stream.value.index, startPos, pos)
  if (startPos !== pos) {
    hasChanges.value = true
    const lastIndex = streamIndex.value.length - 1
    stream.value.index.splice(pos > startPos ? pos + 1 : pos, 0 , stream.value.index[startPos])
    stream.value.index.splice(startPos > pos ? startPos + 1 : startPos, 1)
    stream.value.lastIds[0] = stream.value.index[lastIndex]
  }
  console.log('after drop', stream.value.index)
  dragging.value = false
}

const commitChanges = async () => {
  const error = await reorderProfile(stream.value.index)
  if (!error) hasChanges.value = false
}

const rejectChanges = () => {
  hasChanges.value = false
}

defineExpose({hasChanges, commitChanges, rejectChanges})

</script>

<template>
  <component ref="masonryInstance" :is="masonryComponent" :draggable="draggable" :items="streamIndex">
    <template #default="{ items }">
      <div
          v-for="(id, pos) in items"
          :key="pos"
          :class="['w-full', (singleColumn ? 'mb-4' : ''), draggable ? 'overflow-x-auto overscroll-x-auto bg-stone-100' : '']"
          :draggable="draggable"
          @dragstart="startDrag($event, streamIndex.indexOf(id))"
          @drop="onDrop($event, streamIndex.indexOf(id))"
          @dragover.prevent
          @dragenter.prevent
      >
        <StreamElement :postId="id"
          :singleContent="false"
          :streamName="streamName" />
      </div>
    </template>
    <template v-if="draggable" #filler>
      <div @drop="onDrop($event, streamIndex.length)"
           @dragover.prevent
           @dragenter.prevent
           class="h-48 rounded bg-stone-100 p-2 shadow-md"
      />
    </template>
  </component>
</template>
