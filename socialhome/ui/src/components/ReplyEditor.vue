<template>
  <div class="shadow-lg">
    <div class="flex h-24 text-sm">
      <Textarea ref="replyArea"
        @keyup.ctrl.enter="publishReply"
        v-model="replyText"
        class="flex grow overflow-y-auto overscroll-contain bg-whitey"
        style="resize: none"/>
    </div>
    <div class="grid grid-flow-col-dense space-x-2 text-xs  font-medium text-stone-700">
      <Button @click="publishReply" :label="__('Reply')" class="justify-self-end" :loading="publishing" text icon="pi pi-upload" />
      <Button @click="cancelReply" :label="__('Cancel')" class="justify-self-center" text icon="pi pi-times" />
      <Button @click="fullEditor" :label="__('Full Editor')" class="justify-self-start" text icon="pi pi-window-maximize" />
    </div>
  </div>
</template>

<script setup>
  import { onBeforeUnmount, onMounted, ref } from "vue"
  import { storeToRefs } from "pinia"
  import { useAuthStore } from "@/stores/auth"
  import { useContentsStore } from "@/stores/contents"
  import {extractMentions} from "@/helpers/utils"
  import { Button, Textarea } from "primevue"


  const { post } = defineProps(['post'])
  const { user } = storeToRefs(useAuthStore())
  const { postContent, setEditorProps, toggleReplyEditor } = useContentsStore()

  const replyText = ref(user.value.id !== post.author.id ? `@${post.author.finger} ` : '')
  const replyArea = ref()
  const editor = ref(null)

  const publishing = ref(false)
  const publishReply = async () => {
    publishing.value = true
    const payload = {
      parent: post.id,
      recipients: extractMentions(replyText.value),
      text: replyText.value,
      show_preview: false
    }
    const { error } = await postContent('/api/content/', 'POST', JSON.stringify(payload))
    publishing.value = false
    if (error) console.log('reply error', error)
    else {
      //editor.value.commands.setContent(`@${post.author.finger}&nbsp;`)
      toggleReplyEditor(post.id)
    }
  }

  const cancelReply = () => {
    //editor.value.commands.setContent(`@${post.author.finger}&nbsp;`)
    toggleReplyEditor(post.id)
  }

  const fullEditor = () => {
    toggleReplyEditor(post.id)
    setEditorProps({mode: 'reply',
      id: post.id,
      draftReply: replyText.value})
    // editor.value.commands.setContent(`@${post.author.finger}&nbsp;`)
  }
  onMounted(() => replyArea.value.$el.focus())
  //onBeforeUnmount(() => deleteEditor())
</script>
