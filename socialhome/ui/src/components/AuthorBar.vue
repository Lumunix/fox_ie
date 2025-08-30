<template>
  <div class="relative flex space-x-4 p-2 text-xs text-stone-700">
      <img
            class="float-left w-14 rounded-lg"
            :src="author.avatar_url"
            @error="handleIconError($event)"/>
        <div class="grid grid-cols-1 justify-items-start">
            <router-link :to="{ name: author.is_local ? 'profile-pinned' : 'profile-all', params: { uuid: uuid}}"
            class="text-sm font-medium" :title="authorUrl">
              <span v-html="authorName" />
            </router-link>
            <div class="flex">
                <router-link :to="{ name: 'content', params: { id: post.id } }"
                    class="text-stone-400" :title="post.timestamp">{{ timeStamp }}</router-link>
                <LockClosedIcon v-if="!isPublic" class="h-4 w-4 text-yellow-500" />
            </div>
            <div v-if="isShared" class="flex items-center space-x-1">
                <img
                    class="h-4 w-4 rounded-lg"
                    :src="throughAuthor.avatar_url"
                    @error="handleIconError($event)" />
                <router-link :to="{ name: throughAuthor.is_local ? 'profile-pinned' : 'profile-all', params: { uuid: throughAuthor.uuid}}"
                  class="text-sm font-medium" :title="throughAuthor.home_url">
                  {{throughAuthorName }}
                </router-link>
            </div>
            <div v-else><br></div>
        </div>
      <button v-if="userIsAuthenticated" @click="toggle" id="overlay_menu" aria-haspopup="true" aria-controls="overlay_menu" class="absolute right-0 align-top">
        <i class="pi pi-ellipsis-v" />
      </button>
      <Menu ref="authorMenu" :model="authorItems" :popup="true" class="min-w-min text-sm" />
      <Menu ref="otherMenu" :model="otherItems" :popup="true" class="min-w-min text-sm" />
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import { storeToRefs } from 'pinia'
    import { useContentsStore} from "@/stores/contents"
    import { useProfilesStore } from '@/stores/profiles'
    import { getTimeAgo } from '@/helpers/timeago'
    import { LockClosedIcon } from '@heroicons/vue/24/solid'
    import Menu from 'primevue/menu'
    import {useAuthStore} from "@/stores/auth";
    import { useConfirm } from "primevue/useconfirm"
    import { useGettext} from "vue3-gettext"
    import ponyUrl from '@/assets/pony100.png'

    const { post, uuid } = defineProps(['post', 'uuid'])
    const { $gettext } = useGettext()
    const confirm = useConfirm()

    const { userIsAuthenticated } = storeToRefs(useAuthStore())
    const { deleteContent, setEditorProps } = useContentsStore()
    const { profiles } = storeToRefs(useProfilesStore())
    const { followChange, requestProfileUpdate } = useProfilesStore()
    const author = computed(() => profiles.value[uuid])
    const authorName = computed(() => author.value.name || author.value.finger)
    const authorUrl = computed(() => author.value.home_url || author.value.fid || author.value.handle)
    const isPublic = computed(() => post.visibility === "public")
    const throughAuthor = computed(() => profiles.value[post.through_author.uuid || post.author.uuid])
    const throughAuthorName = computed(() => throughAuthor.value.name || throughAuthor.value.finger)
    const isShared = computed(() => post.through !== post.id)
    const epoch = computed(() => post.timestamp_epoch)
    const timeAgo = getTimeAgo(epoch)
    const timeStamp = computed(() => timeAgo.value + (post.edited ? ` (${$gettext('edited')})` : ""))

    const authorMenu = ref(null)
    const confirmContentDeletion = () => {
      confirm.require({
        message: $gettext('Are you sure? This action is irreversible.'),
        header: $gettext('Delete Content'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: $gettext('Cancel'),
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: $gettext('Delete'),
            severity: 'danger'
        },
        accept: async () => {
          await deleteContent(post.id)
        },
      })
    }
    const authorItems = [
      {
        label: $gettext("Edit"),
        icon: "pi pi-pencil",
        command: () => setEditorProps({mode: 'edit', id: post.id})},
      {
        label: $gettext("Delete"),
        icon: "pi pi-trash",
        command: confirmContentDeletion}
    ]
    const otherMenu = ref(null)
    const otherItems = computed(() => [
      {
        label: author.value.user_following ? $gettext("Unfollow") : $gettext("Follow"),
        icon: author.value.user_following ? "pi pi-minus" : "pi pi-plus",
        command: () => followChange(uuid, !author.value.user_following)
      },
      {
        label: $gettext("Message"),
        icon: "pi pi-envelope",
        command: () => setEditorProps({mode: 'create', recipient: `@${author.value.finger}`})}
    ])
    const toggle = (event) => {
      if (post.user_is_author) {
        authorMenu.value.toggle(event)
      } else {
        otherMenu.value.toggle(event)
      }
    }

    const handleIconError = (evt) => {
        evt.target.src = ponyUrl
        requestProfileUpdate(uuid)
    }

</script>
