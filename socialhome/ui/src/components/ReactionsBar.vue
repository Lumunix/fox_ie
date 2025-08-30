<template>
    <div class="flex justify-end space-x-6 text-sm text-stone-700">
        <div v-if="isPublic && userIsAuthenticated" class="inline-flex items-center">
          <Button :title="shareTitle" @click="toggleShare" icon="pi pi-share-alt" :loading="sharing"
                  text :icon-class="[post.user_has_shared ? 'text-blue-400' : '']"
                  :badge="sharesCount ? sharesCount.toString() : ''"
                  class="gap-0" badge-class="text-blue-400 font-medium"
          />
        </div>
      <Button v-show="userIsAuthenticated || (!userIsAuthenticated && replyCount)"
              @click="toggleRepliesState" :title="repliesTitle" :icon="repliesIcon"
              text :badge="replyCount ? replyCount.toString() : ''"
              class="gap-0" badge-class="text-blue-400 font-medium"
              :disabled="singleContent && !userIsAuthenticated"
      />
      <Button v-if="userIsAuthenticated" icon="pi pi-star" text title="Bookmark" />
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import { storeToRefs } from 'pinia'
    import { useContentsStore } from "@/stores/contents";
    import {useAuthStore} from "@/stores/auth";
    import { useGettext } from "vue3-gettext"
    import Button from 'primevue/button'

    const { post, singleContent } = defineProps(['post', 'singleContent'])
    const { $gettext, $pgettext } = useGettext()
    const { shareChange, toggleReplyEditor, toggleReplies } = useContentsStore()
    const { userIsAuthenticated } = storeToRefs(useAuthStore())

    const isPublic = computed(() => post.visibility === "public")
    const replyCount = computed(() => post.reply_count)
    const sharesCount = computed(() => post.shares_count ? post.shares_count : "")

    const repliesTitle = computed(() =>
        post.showReplies && (post.activeReplyEditor || !userIsAuthenticated.value) ? $gettext('Hide replies')
            : userIsAuthenticated.value && (post.showReplies || !replyCount.value || singleContent) ? $pgettext('reactions','Reply') : $gettext('Show replies'))
    const repliesIcon = computed(() =>
        userIsAuthenticated.value && (post.showReplies || !replyCount.value || singleContent) ? "pi pi-reply"
            : "pi pi-comments")
    const toggleRepliesState = () => {
      if (userIsAuthenticated.value) {
        if (singleContent || !replyCount.value) toggleReplyEditor(post.id)
        else if (replyCount.value) {
          if (post.activeReplyEditor && post.showReplies) {
            toggleReplies(post.id)
            toggleReplyEditor(post.id)
          }
          else if (!post.showReplies) toggleReplies(post.id)
          else toggleReplyEditor(post.id)
        }
      }
      else toggleReplies(post.id)
    }

    const shareTitle = computed(() => post.user_has_shared ? $gettext('Unshare') : $gettext('Share'))
    const sharing = ref(false)
    const toggleShare = async () => {
      sharing.value = true
      await shareChange(post.id, !post.user_has_shared)
      sharing.value = false
    }
</script>
