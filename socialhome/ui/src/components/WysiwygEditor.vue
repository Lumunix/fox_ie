<script setup>
  import {computed, nextTick, onMounted, onUnmounted, onUpdated, ref} from "vue"
  import { useEditor, EditorContent } from '@tiptap/vue-3'
  import { Color } from '@tiptap/extension-color'
  import ListItem from '@tiptap/extension-list-item'
  import TextStyle from '@tiptap/extension-text-style'
  import Highlight from '@tiptap/extension-highlight'
  import Typography from '@tiptap/extension-typography'
  import StarterKit from '@tiptap/starter-kit'
  import Link from '@tiptap/extension-link'
  import Image from '@tiptap/extension-image'
  import {Markdown} from "tiptap-markdown"
  //import Mention from "@tiptap/extension-mention"
  import { Audio, Video } from "@/extensions"
  import InputText from 'primevue/inputtext'
  import Popover from "primevue/popover"
  import Menu from 'primevue/menu'
  import UploadMedia from "@/helpers/UploadMedia.vue"
  import { useGettext } from "vue3-gettext"
  
  const content = defineModel()
  const { $gettext } = useGettext()

  const editor = useEditor({
    autofocus: "end",
    injectCSS: false,
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({ types: [ListItem.name] }),
      StarterKit,
      Highlight,
      Typography,
      Markdown,
      //Mention,
      Image,
      Audio,
      Video,
      Link.configure({
        openOnClick: false,
        defaultProtocol: 'https',
      }),
    ],
    editorProps: {
      attributes: {
        class: "flex-1 whitespace-pre test-stone-700 max-w-none text-sm text-wrap focus:outline-none"
      },
    },
    onUpdate({ editor }) {
      content.value = editor.storage.markdown.getMarkdown()
    },
  })
  
  onMounted(() => editor.value.commands.setContent(content.value))

  const headings = [1,2,3,4,5,6].map((x) => ({label: `H${x}`,command: () => editor.value.chain().focus().toggleHeading({ level: x }).run()}))
  const headingMenu = ref(null)
  const currentHeading = computed(() => [1,2,3,4,5,6].find((h) => editor.value.isActive('heading', {level: h}) === true) ?? '')
  const toggleHeadingMenu = (event) => headingMenu.value.toggle(event)

  const linkUrl = ref('https://')
  const linkPanel = ref(null)
  const linkPanelIsOpen = ref(false)
  const toggleLinkPanel = (event) => {
    linkPanel.value.toggle(event)
    linkPanelIsOpen.value = !linkPanelIsOpen.value
    if (linkPanelIsOpen.value) linkUrl.value = editor.value.isActive('link') ? editor.value.getAttributes('link').href : ''
    //mediaPanel.value.hide()
    mediaPanelIsOpen.value = false
  }
  const hideLinkPanel = () => {
    linkPanelIsOpen.value = false
  }

  const setLink = () => {
      linkPanel.value.hide()
      linkPanelIsOpen.value = false

      const url = linkUrl.value

      // empty
      if (url === '') {
        editor.value
          .chain()
          .focus()
          .extendMarkRange('link')
          .unsetLink()
          .run()

        return
      }

      // update link
      editor.value
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run()
  }

  const mediaPanelIsOpen = ref(false)
  const mediaInfo = ref({
    url: '',
    description: '',
    type: '',
    accept: 'image/*,audio/*,video/*',
    category: 'uploads'
  })
  const mediaUpload = ref(false)
  const mediaError = ref('')

  const toggleMediaPanel = () => {
    mediaInfo.value.url = ''
    mediaInfo.value.description = ''
    mediaInfo.value.type = ''
    mediaError.value = ''
    mediaPanelIsOpen.value = !mediaPanelIsOpen.value
    if (mediaPanelIsOpen.value) {
      if (isActiveMedia.value) {
        const type = editor.value.view.state.selection.node.type.name
        if (type === 'image') {
          mediaInfo.value.description = editor.value.getAttributes(type).title
        }
        mediaInfo.value.url = editor.value.getAttributes(type).src
        mediaInfo.value.type = type
      }
      mediaUpload.value = false
    }
    linkPanel.value.hide()
  }
  const hideMediaPanel = () => {
    mediaPanelIsOpen.value = false
  }

  const setMedia = async (info) => {
    hideMediaPanel()

    Object.assign(mediaInfo.value, info)
    switch(mediaInfo.value.type.split('/')[0]) {
      case 'image':
        editor.value
            .chain()
            .focus()
            .setImage({ src: mediaInfo.value.url, alt: mediaInfo.value.description, title: mediaInfo.value.description })
            .run()
        break
      case 'audio':
        editor.value
            .chain()
            .focus()
            .setAudio(mediaInfo.value.url)
            .run()
        break
      case 'video':
        editor.value
            .chain()
            .focus()
            .setVideo(mediaInfo.value.url)
            .run()
        break
      default:
        mediaError.value = $gettext('No or invalid media') // TODO: use a toast here
    }

  }

  const isActiveMedia = computed(() => editor.value.isActive('image') || editor.value.isActive('audio') || editor.value.isActive('video'))

</script>

<template>
      <div v-if="editor" class="flex flex-none items-center space-x-1 p-2 font-serif text-stone-700 md:space-x-3 md:text-xl">
          <button
              :title="__('Bold')"
              @click="editor.chain().focus().toggleBold().run()" :disabled="!editor.can().chain().focus().toggleBold().run()"
              class="rounded px-1 font-bold" :class="[editor.isActive('bold') ? 'bg-stone-900 text-white' : '']">
            B
          </button>
          <button
              :title="__('Italic')"
              @click="editor.chain().focus().toggleItalic().run()" :disabled="!editor.can().chain().focus().toggleItalic().run()"
              class="rounded px-1 italic" :class="[editor.isActive('italic') ? 'bg-stone-900 text-white' : '']">
            I
          </button>
        <button
            :title="__('Headings')"
            class="rounded" :class="[editor.isActive('heading') ? 'bg-stone-900 text-white' : '']"
            aria-haspopup="true" aria-controls="overlay_menu"
            @click="toggleHeadingMenu"
        >
          {{ `H${currentHeading}` }}
        </button>
        <Menu ref="headingMenu" :popup=true :model="headings" class="min-w-min" />
          <button
              :title="__('Link')"
              class="rounded px-1" :class="[linkPanelIsOpen || editor.isActive('link') ? 'bg-stone-900 text-white' : '']"
              @click="toggleLinkPanel"
          >
            <v-icon name="fa-link" class="align-middle" />
          </button>
          <Popover ref="linkPanel" @hide="hideLinkPanel" small>
            <form @submit="setLink" method="dialog">
              <InputText v-model.lazy.trim="linkUrl"
                         type="url"
                         autofocus
                         pattern="(https|ftp)://.*"
                         :placeholder="__('Enter url')"
                         class="bg-white text-sm placeholder:italic md:w-96"
              />
            </form>
          </Popover>
          <button
              :title="__('Media')"
              class="rounded px-1" :class="[mediaPanelIsOpen  || isActiveMedia ? 'bg-stone-900 text-white' : '']"
              @click="toggleMediaPanel"
          >
            <v-icon name="fa-regular-image" class="align-middle" />
          </button>
        <UploadMedia v-model:visible="mediaPanelIsOpen" :info="mediaInfo" @media-uploaded="setMedia"
           :cropperOptions="{canvas: {width: 2048}}"
           :title="__('Set media link / Upload media')"/>
        <button
              :title="__('List')"
              @click="editor.chain().focus().toggleBulletList().run()"
              class="rounded px-1" :class="[editor.isActive('bulletList') ? 'bg-stone-900 text-white' : '']"
          >
            <v-icon name="fa-list-ul" />
          </button>
          <button
              :title="__('Ordered List')"
              @click="editor.chain().focus().toggleOrderedList().run()"
              class="rounded px-1" :class="[editor.isActive('orderedList') ? 'bg-stone-900 text-white' : '']"
          >
            <v-icon name="fa-list-ol" />
          </button>
          <button
              :title="__('Code')"
              @click="editor.chain().focus().toggleCodeBlock().run()"
              class="rounded px-1" :class="[editor.isActive('codeBlock') ? 'bg-stone-900 text-white' : '']"
          >
            <v-icon name="fa-code" />
          </button>
          <button
              :title="__('Quote')"
              @click="editor.chain().focus().toggleBlockquote().run()"
              class="rounded px-1" :class="[editor.isActive('blockquote') ? 'bg-stone-900 text-white' : '']"
          >
            <v-icon name="fa-quote-left" />
          </button>
          <button
              :title="__('Capture')"
          >
            <v-icon name="fa-camera" class="text-slate-300"/>
          </button>
        </div>
      <hr>
      <editor-content :editor="editor" autofocus class="flex grow overflow-y-auto overscroll-contain bg-white"/>
</template>
