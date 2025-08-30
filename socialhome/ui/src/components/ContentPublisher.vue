<script setup>
  import {computed, onBeforeMount, onMounted, onUnmounted, onUpdated, ref } from "vue"
  import { storeToRefs } from "pinia"
  import { useContentsStore } from "@/stores/contents"
  import Button from 'primevue/button'
  import Checkbox from 'primevue/checkbox'
  import Dialog from 'primevue/dialog'
  import Divider from 'primevue/divider'
  import Drawer from 'primevue/drawer'
  import Message from 'primevue/message'
  import MultiSelect from 'primevue/multiselect'
  import RadioButton from 'primevue/radiobutton'
  import Select from 'primevue/select'
  import { useRouter } from "vue-router"
  import { useGettext } from "vue3-gettext"
  import { extractMentions } from "@/helpers/utils";
  import MarkdownEditor from "@/components/MarkdownEditor.vue"
  //import WysiwygEditor from "@/components/WysiwygEditor.vue"

  defineOptions({
    inheritAttrs: false,
    customOptions: {},
  })

  //const props = defineProps(['id'])

  const router = useRouter()
  const { $gettext } = useGettext()
  const translations = {
    createContent: $gettext('Create new content'),
    editContent: $gettext('Edit content'),
    createReply: $gettext('Create new reply'),
    editReply: $gettext('Edit reply')
  }
  const { contents, editorProps } = storeToRefs(useContentsStore())
  const { getContent, postContent } = useContentsStore()
  const content = ref(null)
  const isContent = computed(() => !editorProps.value?.id
      || content.value && content.value.content_type === 'content'
      && editorProps.value.mode !== 'reply')
  const isEditing = computed(() => editorProps.value?.mode === 'edit')
  const title = computed(() => {
    if (isEditing.value) return `${isContent.value ? translations.editContent : translations.editReply}`
    else return `${isContent.value ? translations.createContent : translations.createReply}`
  })

  const editor = ref()
  
  const visibilities = [
    {id: 'public', icon: 'bi-globe2', label: $gettext('Public'),
      description: $gettext('visible to everyone, including search bots'), value: 0},
    {id: 'limited', icon: 'hi-lock-closed', label: $gettext('Limited'),
      description: $gettext('visible only to chosen friends'), value: 1},
    {id: 'site', icon: 'hi-home', label: $gettext('Local'),
      description: $gettext('visible only to users of this instance'), value: 2},
    {id: 'self', icon: 'bi-person', label: $gettext('Only me'),
      description: $gettext('visible only to me (can be used as draft)'), value: 3}
  ]
  const selectedVisibility = ref(visibilities[0])

  const federate = ref(true)

  const options = computed(() => [
    {id: 0, description: $gettext('Include mutuals'), isDisabled: selectedVisibility.value.id !== 'limited' || !isContent.value},
    {id: 1, description: $gettext('Add OEmbed / OpenGraph preview'), isDisabled: false},
    {id: 2, description: $gettext('Disable comments'), isDisabled: true},
    {id: 3, description: $gettext('Pinned post'), isDisabled: !isContent.value}
  ])
  const selectedOptions = ref([options.value[1]])

  const optionsVisible = ref(false)


  //let browserBack = undefined
  const visible = ref(false)
  let initialPayload = {}
  const preparePayload = (text, includeMutuals, recipients) => {
    let payload
    if (isContent.value) {
      payload = {
        federate: federate.value,
        include_following: includeMutuals,
        order: 0,
        pinned: !!selectedOptions.value.find((option) => option.id === 3),
        recipients: recipients,
        show_preview: !!selectedOptions.value.find((option) => option.id === 1),
        service_label: "",
        text: text,
        visibility: selectedVisibility.value.value
      }
    } else {
      payload = {
        parent: isEditing.value ? content.value.parent : content.value.id,
        show_preview: selectedOptions.value.length !== 0,
        text: text,
        recipients: recipients,
      }
    }
    return payload
  }

  //onBeforeMount(() => visible.value = true)
  const editorContent = ref('')
  onMounted(async () => {
    if (editorProps.value?.id) {
      const contentId = editorProps.value.id
      const result = await getContent(contentId)
      if (result.error) closeEditor()
      content.value = result.content.id !== contentId ? contents.value[contentId] : result.content
      if (isEditing.value) {
        console.log('editing user', content.value.user_is_author, isEditing.value)
        if (!content.value.user_is_author) {
          editorProps.value = undefined
          return
        }
        //editor.value.setContent(content.value.text)
        editorContent.value = content.value.text
        if (isContent.value) {
          federate.value = content.value.federate
          selectedVisibility.value = visibilities.find((v) => v.id === content.value.visibility)
          selectedOptions.value = []
          if (content.value.include_following) selectedOptions.value.push(options.value[0])
          if (content.value.show_preview) selectedOptions.value.push(options.value[1])
          if (content.value.pinned) selectedOptions.value.push(options.value[3])
        }
      }
      else if (!isContent.value) {
        //editor.value.setContent(editorProps.value?.draftReply ?? `@${content.value.author.finger}`)
        editorContent.value = editorProps.value?.draftReply ?? `@${content.value.author.finger}`
      }
      initialPayload = preparePayload(
          content.value.text,
          content.value.include_following,
          Array.from(content.value.recipients, (c) => c.toLowerCase()))
    } else if (editorProps.value?.recipient) {
      //editor.value.setContent(editorProps.value.recipient)
      editorContent.value = editorProps.value.recipient
      selectedVisibility.value =  visibilities[1]
    }
    visible.value = true
  })

  onUnmounted(() => {
    closeEditor()
  })

  const loadingContent = ref(false)
  const contentError = ref('')
  const publishContent = async () => {
    const text = editor.value.getContent()
    if (!text.match(/\w+/)) {
      contentError.value = $gettext('No content!')
      return
    }
    const recipients = extractMentions(text)
    const includeMutuals = isContent.value ? !!selectedOptions.value.find((option) => option.id === 0) : false
    if (selectedVisibility.value.id === 'limited' && !(includeMutuals || recipients.length > 0)) {
      contentError.value = $gettext('Please select the "Include mutuals" option and/or include one or more mentions')
      return
    }
    loadingContent.value = true
    const payload = preparePayload(text, includeMutuals, recipients)
    let method = 'POST'
    let apiEndpoint = '/api/content/'
    if (isEditing.value) {
      method = 'PATCH'
      apiEndpoint = `/api/content/${content.value.id}/`
      if (isContent.value) {
        if (payload.pinned) payload.order = content.value.order
      }
      else delete payload['recipients']
    }
    if (JSON.stringify(initialPayload) === JSON.stringify(payload)) {
      contentError.value = $gettext('Content is unchanged')
    } else {
      const { content, error } = await postContent(apiEndpoint, method, JSON.stringify(payload))
      contentError.value = error
      if (!error) {
        closeEditor()
        await router.push({ name: 'content', params: { id: isContent.value ? content.id: content.root_parent } })
      }
    }
    loadingContent.value = false
  }

  function closeEditor() {
    editorProps.value = undefined
    //editor.value.destroy()
    visible.value = false
  }

</script>

<template>
  <Dialog v-model:visible="visible" modal maximizable :close-on-escape="false" :draggable="false"
          @hide="closeEditor()" class="h-3/4 w-screen md:w-3/4"
          contentClass="flex grow flex-col"
  >
    <template #header>
      <span class="md:text-xl">{{ title }}</span>
    </template>
    <!-- <WysiwygEditor ref="editor" v-model="editorContent" /> -->
    <template #default>
      <MarkdownEditor ref="editor" :content="editorContent"/>
      <Message v-if="contentError"
               severity="error"
               :life="5000"
               @life-end="contentError=''"
               class="mb-1 flex w-full justify-end">
        {{ contentError }}
      </Message>
      <hr>
      <div class="flex">
        <Select v-if="isContent" v-model="selectedVisibility" checkmark :options="visibilities" optionLabel="label"
           labelClass="text-sm"  class="hidden border-none shadow-lg md:flex">
          <template #value="slotProps">
            <div class="inline-block space-x-2 pl-5 align-middle">
              <v-icon :name="slotProps.value.icon" class="text-blue-700"/>
              <span>{{ slotProps.value.label }}</span>
            </div>
          </template>
          <template #option="slotProps">
            <div class="grid grid-cols-[min-content_1fr]">
              <div class="w-14 text-sm">{{ slotProps.option.label }}</div>
              <div class="whitespace-nowrap pl-5 text-xs italic text-stone-700">{{ slotProps.option.description}}</div>
            </div>
          </template>
        </Select>
        <button v-if="isContent" class="relative ml-2 hidden flex-row space-x-1 rounded bg-surface-0 p-3 text-sm shadow-md focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-300 md:flex">
          <input id="federate" type="checkbox" v-model="federate" class="cursor-pointer"/>
          <label for="federate">{{ __('Federate') }}</label>
        </button>
        <MultiSelect v-if="isContent" v-model="selectedOptions" :options="options" optionLabel="description" optionDisabled="isDisabled"
                     checkmark class="ml-2 hidden border-none shadow-lg md:flex" :showToggleAll="false" :placeholder="$gettext('More options')"
        >
          <template #value>
            <span class="mt-1 text-sm">{{ __('More options') }}</span>
          </template>
          <template #option="slotProps">
            <span class="text-sm">{{ slotProps.option.description}}</span>
          </template>
        </MultiSelect>
        <div v-else class="hidden items-center p-2 align-middle shadow-lg md:flex">
          <Checkbox v-model="selectedOptions" inputId="preview" :binary="true" />
          <label for="preview" class="ml-2 whitespace-nowrap text-sm">{{ options[1].description }}</label>
        </div>
        <div v-if="isContent" class="flex md:hidden">
          <Drawer v-model:visible="optionsVisible" :header="__('Options')" class="!h-min !w-fit text-sm">
            <span class="border-b-2 font-medium">{{ __('Visibilities') }}</span>
            <div class="flex flex-col">
              <div v-for="visibility of visibilities" :key="visibility.id" class="mt-1 flex items-center">
                <RadioButton v-model="selectedVisibility" :inputId="visibility.id" name="dynamic"
                             :value="visibility"/>
                <label :for="visibility.id" class="ml-2 grid grid-cols-[min-content_1fr] items-center">
                  <span class="w-14 whitespace-nowrap text-sm">{{ visibility.label }}</span>
                  <span class="pl-5 text-xs italic text-stone-700">{{ visibility.description}}</span>
                </label>
              </div>
            </div>
            <Divider />
            <button v-if="isContent" class="relative flex flex-row space-x-1 rounded bg-surface-0 text-sm focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-300">
              <input id="federate" type="checkbox" v-model="federate" class="cursor-pointer"/>
              <label for="federate">{{ __('Federate') }}</label>
            </button>
            <Divider />
            <span class="border-b-2 font-medium">{{ __('More options') }}</span>
            <div class="flex flex-col">
              <div v-for="option in options" :key="option.id" class="mt-1 flex items-center">
                <Checkbox v-model="selectedOptions" :inputId="option.id.toString()" :value="option" :disabled="option.isDisabled"/>
                <label :for="option.id.toString()" class="ml-2 text-sm">{{ option.description }}</label>
              </div>
            </div>
          </Drawer>
          <Button text type="button" class="border-none !px-2 text-sm shadow-lg"
                  :label="__('Options')" @click="optionsVisible = true" />
        </div>
        <div v-else class="flex items-center p-2 align-middle shadow-lg md:hidden">
          <Checkbox v-model="selectedOptions" inputId="preview" :binary="true" />
          <label for="preview" class="ml-2 whitespace-nowrap text-xs">{{ options[1].description }}</label>
        </div>
        <div class="flex w-full justify-end">
          <Button @click="publishContent"
                  text
                  icon="pi pi-upload"
                  icon-class="text-blue-400"
                  :label="isEditing ? __('Update') : __('Publish')"
                  type="button"
                  :loading="loadingContent"
                  class="ml-2 border-none !px-2 text-sm shadow-lg" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

