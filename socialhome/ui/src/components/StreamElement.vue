<template>
  <div v-infinite-scroll="[onLoadMore, { canLoadMore: () => doLoadMore }]"
       class="w-full overflow-x-auto overscroll-x-auto">
    <div :id="elementId" class="min-w-72 rounded bg-stone-100 p-2 shadow-lg">
      <AuthorBar :uuid="post.author.uuid" :post="post" />
      <fix-html ref="element" class="overflow-hidden text-stone-700 text-sm" :html="post.rendered" />
      <ReactionsBar :post="post" :singleContent="singleContent" />
      <ReplyEditor v-if="post.activeReplyEditor" :post="post"/>
    </div>
  </div>
  <div v-if="showReplies()" class="bg-stone-200">
    <div v-if="post.reply_count">
      <div v-if="!post.parent" class="mt-2 w-full items-center border-b border-emerald-600 pl-2 text-sm text-emerald-600">Replies</div>
      <div v-for="replyId in post.replyIds" :key="replyId" class="mt-2">
        <div :class="contents[replyId].author.id === post.author.id ? '' : 'ml-1 border-l border-emerald-600'">
          <StreamElement :postId="replyId" :singleContent="singleContent" :streamName="streamName" />
        </div>
      </div>
      <button @click="hideReplies" v-if="!post.parent && !singleContent" :title="__('Hide replies')">
        <v-icon name="bi-caret-up-fill" scale="2" class="text-emerald-600"/>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, onActivated, onDeactivated, onMounted, onUnmounted, onUpdated, ref, watch } from "vue"
import { storeToRefs } from 'pinia'
import { vInfiniteScroll } from '@vueuse/components'
import { useContentsStore } from '@/stores/contents'
import AuthorBar from '@/components/AuthorBar.vue'
import ReactionsBar from '@/components/ReactionsBar.vue'
import FixHtml from "@/helpers/FixHtml.vue";
import ReplyEditor from "@/components/ReplyEditor.vue"
import fitvids from "fitvids"
import {useAuthStore} from "@/stores/auth"

const emit = defineEmits(['mediaLoaded'])
const { postId, singleContent, streamName } = defineProps(['postId', 'singleContent', 'streamName'])
const { verticalPosition, updateVerticalPosition} = inject('verticalPosition')
const { contents, isFetching, streams } = storeToRefs(useContentsStore())
const { loadMore, toggleReplies } = useContentsStore()
const { userIsAuthenticated } = storeToRefs(useAuthStore())
const post = computed(() => contents.value[postId])
const elementId = computed(() => post.value.content_type === 'content' ? `c${postId}` : `r${postId}`)
const currentStream = computed(() => streams.value[streamName])
const currentLastId = computed(() => streams.value[streamName].lastIds[0])
const loading = ref(false)
const doLoadMore = computed(() =>
    currentLastId.value === post.value.id
      && !loading.value
      && !singleContent
      && !currentStream.value.noMoreData)

let seenId = undefined
const onLoadMore = async () => {
  console.log('seenId', seenId, currentLastId.value, doLoadMore.value)
  if (seenId !== currentLastId.value) {
    seenId = currentLastId.value
    //isFetching.value = true
    loading.value = true
    await loadMore()
    loading.value = false
  }
}

const mediaHeightUpdates = () => {
  fitvids(`#${elementId.value}`)
}
onMounted(mediaHeightUpdates)
onUpdated(mediaHeightUpdates)
//onUnmounted(() => console.log('element unmounted', post.value.id))
//onDeactivated(() => {
  //console.log('element deactivated', post.value.id)
  //resizeObserver.unobserve(element.value.$el)
//})
let positionInformation = null

const showReplies = () => {
  let ret = post.value.showReplies || (singleContent && post.value.replyIds.length > 0)
  if (ret && !positionInformation) positionInformation = verticalPosition.value
  return ret
}
const hideReplies = () => {
  updateVerticalPosition(positionInformation)
  positionInformation = null
  toggleReplies(postId)
}
</script>

