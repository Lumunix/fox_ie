<script setup>
import { computed, nextTick, onMounted, onUnmounted, onUpdated, ref, shallowRef, toValue } from 'vue'
import { EditorView, keymap } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { indentWithTab } from '@codemirror/commands'
import { basicSetup, translations } from "@/helpers/codemirrorSetup.js"
//import CodeMirror from 'vue-codemirror6'
import {syntaxTree} from "@codemirror/language"
import {markdown, markdownLanguage} from "@codemirror/lang-markdown"
import { InputText, Menu, Popover } from "primevue"
import { useToast } from "primevue/usetoast"
import UploadMedia from "@/helpers/UploadMedia.vue"
import { marked } from "marked"
import FixHtml from "@/helpers/FixHtml.vue"
import { useGettext} from "vue3-gettext"

const { content } = defineProps(['content'])
const toast = useToast()
const { $gettext } = useGettext()
const preview = ref(false)
const theme = {"&.cm-editor": {width: "100%"}, ".cm-scroller": {overflow: "auto"}}
const cm = new EditorView({
  doc: toValue(content),
  extensions: [
    basicSetup,
    markdown({base: markdownLanguage}),
    EditorView.theme(theme),
    EditorView.lineWrapping,
    keymap.of([indentWithTab]),   
    EditorState.phrases.of(translations),
    EditorView.updateListener.of((view) => getActiveNodes(view)),
    EditorView.domEventHandlers({drop(event, view) {handleDrop(event, view)}})
  ]
})

onMounted(() => {
  document.getElementById('editor').insertAdjacentElement('afterbegin', cm.dom)
  //  hack. Primevue's Dialog component looks for the autofocus attribute in the rendered DOM
  cm.contentDOM.setAttribute('autofocus', '')
  cm.dispatch({selection: {anchor: 0}})
})

onUnmounted(() => cm.destroy())
//onUpdated(() => {if (!linkPanelIsOpen.value && !mediaPanelIsOpen.value) cm.focus()})

let activeNodes = shallowRef({})
const htmlParser = new DOMParser()
let mainTree
let editorState
let selection
const getActiveNodes = (view) => {
  console.log('transactions', view.transactions[0]?.changes.desc)
  if (!view.selectionSet && view.transactions.length === 0) return
  editorState = view.state
  mainTree = syntaxTree(view.state)
  selection = editorState.selection.main
  let node = mainTree.resolve(view.state.selection.main.head)
  let name = node.type.name
  const tree =  {}
  tree[name] =  node
  let parent = node.parent
  while (parent) {
    name = parent.type?.name
    if (!['Document', 'Paragraph'].includes(name)) {
      tree[name] = parent
    }
    parent = parent.parent
  }
  // identify audio and video tags
  // this won't handle multiple media tags in the same html block
  const htmlNodes = Object.keys(tree).filter(name => ['HTMLBlock', 'HTMLTag'].includes(name))
  //console.log('htmlNodes', htmlNodes)
  Array.from(htmlNodes, (name) => { 
    //console.log('HTML', name, tree[name].nextSibling?.type?.name)
    // A HTMLBlock node not preceded by a Document node shows up as
    // a HTMLTag for video and audio HTML tags. Is this a bug?
    if (name === 'HTMLTag') {
      const prevNode = mainTree.resolve(tree[name].from - 1)
      //console.log('prevNode', prevNode.type?.name)
      if (prevNode.type.name !== 'Document') {
        cm.dispatch({changes: {from: tree[name].from-1, insert: '\n'}})
        return
      }
    }
    const html = htmlParser.parseFromString(view.state.sliceDoc(tree[name].from, tree[name].to), "text/html")
    const node = {from: tree[name].from, to: tree[name].to}
    if (html.getElementsByTagName('audio').length > 0) tree['Audio'] = Object.assign(node, {html: html.getElementsByTagName('audio')[0]})
    else if (html.getElementsByTagName('video').length > 0) tree['Video'] = Object.assign(node, {html: html.getElementsByTagName('video')[0]})
  })

  // No need to re-render the component while a user is typing
  if (!view.transactions[0]?.isUserEvent('input.type')) activeNodes.value = tree
  console.log('tree', tree, activeNodes.value)
}

const defs = {
  Emphasis: {syntax: '_', offset: 1},
  StrongEmphasis: {syntax: '**', offset: 2},
  BulletList: {syntax: '- ', offset: 2, pattern: /(^\s*)[+\-*]\s/gm},
  OrderedList: {syntax: '1. ', offset: 3, pattern: /(^\s*)\d[.)]\s/gm}
}

const toggleEmphasis = (tag) => {
  const {syntax, offset} = defs[tag]
  console.log(tag, syntax, offset)
  if (activeNodes.value[tag]) {
    const node = activeNodes.value[tag]
    let text = editorState.sliceDoc(node.from+offset, node.to-offset)
    cm.dispatch({changes: {from: node.from, to: node.to, insert: text}})
    cm.dispatch({selection: {anchor: selection.to-offset*2}})
  } else {
    let text = editorState.sliceDoc(selection.from, selection.to)
    const cursorOffset = text ? offset*2 : offset
    text = syntax + text + syntax
    cm.dispatch({changes: {from: selection.from, to: selection.to, insert: text}})
    cm.dispatch({selection: {anchor: selection.to+cursorOffset}})
  }
}

const headings = [1,2,3,4,5,6].map((h) => ({label: `H${h}`,command: () => toggleHeading(h)}))
const headingMenu = ref(null)
const currentHeading = computed(() => [1,2,3,4,5,6].find((h) => activeNodes.value[`ATXHeading${h}`]) ?? '')
const toggleHeadingMenu = (event) => {
  if (currentHeading.value) {
    const node = activeNodes.value[`ATXHeading${currentHeading.value}`]
    const offset = currentHeading.value + 1
    const text = editorState.sliceDoc(node.from+offset, node.to)
    const line = editorState.doc.lineAt(selection.from)
    cm.dispatch({changes: {from: node.from, to: node.to, insert: text}})
    cm.dispatch({selection: {anchor: selection.from > offset ? selection.from - offset : line.from}})
  } else {
    headingMenu.value.toggle(event)
  }
}
const toggleHeading = (level)  => {
  const syntax = '#'.repeat(level) + ' '
  console.log('ligne', editorState.doc.lineAt(selection.from), selection.from)
  const line = editorState.doc.lineAt(selection.from)
  cm.dispatch({changes: {from: line.from, insert: syntax}})
  cm.dispatch({selection: {anchor: selection.from+level+1}})
  
}

const linkUrl = ref('https://')
const linkPanel = ref(null)
const linkPanelIsOpen = ref(false)
let urlNode
let linkText = ''
const toggleLinkPanel = (event) => {
  linkPanel.value.toggle(event)
  linkPanelIsOpen.value = !linkPanelIsOpen.value
  selection = editorState.selection.main
  const node = activeNodes.value['Link']
  if (node) {
    urlNode = node.getChild('URL')
    linkUrl.value = editorState.sliceDoc(urlNode.from, urlNode.to)    
  } else {
    linkText = editorState.sliceDoc(selection.from, selection.to)
    console.log('link text', linkText)
  }
  
  mediaPanelIsOpen.value = false
}
const hideLinkPanel = () => {
  linkPanelIsOpen.value = false
  urlNode = undefined
  linkText = ''
  selection = undefined
  cm.focus()
}

const setLink = () => {
    linkPanel.value.hide()
    linkPanelIsOpen.value = false

    if (urlNode) {
      cm.dispatch({changes: {from: urlNode.from, to: urlNode.to, insert: linkUrl.value}})
    } else {
      const markdown = `[${linkText ? linkText : linkUrl.value}](${linkUrl.value})`
      cm.dispatch({changes: {from: selection.from, to: selection.to, insert: markdown}})
    }
    cm.dispatch({selection: {anchor: activeNodes.value['Link']?.from ?? selection.from}})
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
  if (activeNodes.value['FencedCode']) {
    toast.add({severity: 'error', summary: $gettext('Forbidden!'), detail: $gettext('Media upload in code blocks not allowed'), life: 5000})
    return
  }
  mediaInfo.value.url = ''
  mediaInfo.value.description = ''
  mediaInfo.value.type = ''
  mediaInfo.value.droppedFile = undefined
  mediaError.value = ''
  mediaPanelIsOpen.value = !mediaPanelIsOpen.value
  selection = editorState.selection.main
  if (mediaPanelIsOpen.value) {
    if (activeMediaNode.value) {
      let type = (activeMediaNode.value.type?.name ?? activeMediaNode.value.html.tagName).toLowerCase()
      if (type === 'image') {
        const linkTitleNode = activeMediaNode.value.getChild('LinkTitle')
        if (linkTitleNode) {
          const description = editorState.sliceDoc(linkTitleNode.from, linkTitleNode.to)
          mediaInfo.value.description = description.substring(1, description.length-1)
        }
        urlNode = activeMediaNode.value.getChild('URL')
        mediaInfo.value.url = editorState.sliceDoc(urlNode.from, urlNode.to)
        } else {
        const html = activeMediaNode.value.html
        const url = html.getAttribute('src') ?? (html.getElementsByTagName('source').length > 0 ? html.getElementsByTagName('source')[0].getAttribute('src') : '')
        console.log('url', url, html.getElementsByTagName('source')[0])
        mediaInfo.value.url = url
        mediaInfo.value.description = html.getAttribute('title') ?? ''
        }
      mediaInfo.value.type = type
      console.log('media', mediaInfo.value)
      mediaUpload.value = false
    }
  }
  linkPanel.value.hide()
}

const setMedia = (info) => {
  console.log('setMedia', info)
  mediaPanelIsOpen.value = false

  const type = info.type.split('/')[0]
  if (activeMediaNode.value) Object.assign(selection, {from: activeMediaNode.value.from, to: activeMediaNode.value.to})
  switch(type) {
    case 'image':
      cm.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: `![${info.description}](${info.url} "${info.description}")`
        }
      })
      break
    case 'audio':
    case 'video':
      cm.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: `<${type} controls title="${info.description}">\n  <source src="${info.url}">\n</video>`
        }
      })
    break
  }
}

const activeMediaNode = computed(() => activeNodes.value['Image'] ?? activeNodes.value['Audio'] ?? activeNodes.value['Video'])

const toggleList = (tag) => {
  const {syntax, offset, pattern} = defs[tag]
  const node = activeNodes.value[tag]
  if (node) {
    const text = editorState.sliceDoc(node.from, node.to).replace(pattern, '$1')
    console.log('list tag', tag, text)
    cm.dispatch({changes: {from: node.from, to: node.to, insert: text}})
    cm.dispatch({selection: {anchor: node.from}})
  } else {
    let line
    let text = ''
    let num  = editorState.doc.lineAt(selection.from).number
    const last = editorState.doc.lineAt(selection.to).number
    if (num === last) {
      line = editorState.doc.line(num)
      cm.dispatch({changes: {from: line.from, insert: syntax}})
    } else {
      while (num <= last) {
        line = editorState.doc.line(num++)
        text = text + syntax + line.text + '\n'
      } 
      cm.dispatch({changes: {from: selection.from, to: selection.to, insert: text}})
    }
    cm.dispatch({selection: {anchor: selection.from+offset}})
  }
}

const toggleFencedCode = () => {
  console.log('CodeBlock')
  const syntax = '```'
  const offset = 4
  const node = activeNodes.value['FencedCode']
  let text
  if (node) {
    text = editorState.sliceDoc(node.from+offset, node.to-offset)
    console.log('text', text, node.from, node.to)
    cm.dispatch({changes: {from: node.from, to: node.to, insert: text}})
    cm.dispatch({selection: {anchor: selection.to-offset}})
  } else {
    const from = editorState.doc.lineAt(selection.from).from
    const to = editorState.doc.lineAt(selection.to).to
    text = syntax + '\n' + editorState.sliceDoc(from, to) + '\n' + syntax
    cm.dispatch({changes: {from, to, insert: text}})
    cm.dispatch({selection: {anchor: selection.to+offset}})
  }
}

const toggleQuote = () => {
  const syntax = '> '
  const pattern = /^>\s/gm
  const node = activeNodes.value['Blockquote']
  let firstLine, lastLine, from, to, offset, text
  if (node) {
    firstLine = editorState.doc.lineAt(node.from)
    offset  = (editorState.doc.lineAt(selection.head).number - firstLine.number + 1) * 2
    text = editorState.sliceDoc(node.from, node.to).replace(pattern, '')
    cm.dispatch({changes: {from: node.from, to: node.to, insert: text}})
    cm.dispatch({selection: {anchor: selection.head-offset}})
  } else {
    firstLine = editorState.doc.lineAt(selection.from)
    lastLine = editorState.doc.lineAt(selection.to)
    from = firstLine.from
    to = lastLine.to
    offset  = (editorState.doc.lineAt(selection.head).number - firstLine.number + 1) * 2
    text = editorState.sliceDoc(from, to).replace(/^/gm, syntax)
    cm.dispatch({changes: {from, to, insert: text}})
    cm.dispatch({selection: {anchor: selection.head+offset}})
  }
}

const togglePreview = () => {
  preview.value = !preview.value
  if (!preview.value) nextTick(() => cm.focus())
}
const handleDrop = (event, view) => {
  console.log('DROPPED!', event.dataTransfer.files, view.posAtCoords({x: event.x, y: event.y}))
  const position = view.posAtCoords({x: event.x, y: event.y})
  view.dispatch({selection: {anchor: position}})
  if (activeNodes.value['FencedCode']) {
    toast.add({severity: 'error', summary: $gettext('Forbidden!'), detail: $gettext('Drag & drop in code blocks not allowed'), life: 5000})
    return
  }
  mediaInfo.value.droppedFile = event.dataTransfer.files[0]
  mediaInfo.value.type = event.dataTransfer.files[0].type
  mediaPanelIsOpen.value = true
}

const getContent = () => cm.state.doc.toString()
defineExpose({getContent})

</script>

<template>
    <div class="flex">
      <div v-show="!preview" class="flex flex-none items-center space-x-1 p-2 font-serif text-stone-700 md:space-x-3 md:text-xl">
          <button
              :title="__('Bold')"
              @click="toggleEmphasis('StrongEmphasis')"
              class="rounded px-1 font-bold" :class="[activeNodes['StrongEmphasis'] ? 'bg-stone-900 text-white' : '']">
            B
          </button>
          <button
              :title="__('Italic')"
              @click="toggleEmphasis('Emphasis')"
              class="rounded px-1 italic" :class="[activeNodes['Emphasis'] ? 'bg-stone-900 text-white' : '']">
            I
          </button>
        <button
            :title="__('Headings')"
            :disabled="!!activeNodes['FencedCode']"
            class="rounded" :class="[currentHeading ? 'bg-stone-900 text-white' : '']"
            aria-haspopup="true" aria-controls="overlay_menu"
            @click="toggleHeadingMenu"
        >
          {{ `H${currentHeading}` }}
        </button>
        <Menu ref="headingMenu" :popup=true :model="headings" class="min-w-min" />
          <button
              :title="__('Link')"
              class="rounded px-1" :class="[linkPanelIsOpen || activeNodes['Link'] ? 'bg-stone-900 text-white' : '']"
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
              class="rounded px-1" :class="[mediaPanelIsOpen  || activeMediaNode ? 'bg-stone-900 text-white' : '']"
              @click="toggleMediaPanel"
          >
            <v-icon name="fa-regular-image" class="align-middle" />
          </button>
        <UploadMedia v-model:visible="mediaPanelIsOpen" :info="mediaInfo" @media-uploaded="setMedia" @hide="nextTick(() => cm.focus())"
           :cropperOptions="{canvas: {maxWidth: 2048}}"
           :title="__('Set media link / Upload media')"/>
        <button
              :title="__('List')"
              @click="toggleList('BulletList')"
              class="rounded px-1" :class="[activeNodes['BulletList'] ? 'bg-stone-900 text-white' : '']"
          >
            <v-icon name="fa-list-ul" />
          </button>
          <button
              :title="__('Ordered List')"
              @click="toggleList('OrderedList')"
              class="rounded px-1" :class="[activeNodes['OrderedList'] ? 'bg-stone-900 text-white' : '']"
          >
            <v-icon name="fa-list-ol" />
          </button>
          <button
              :title="__('Code')"
              @click="toggleFencedCode()"
              class="rounded px-1" :class="[activeNodes['FencedCode'] ? 'bg-stone-900 text-white' : '']"
          >
            <v-icon name="fa-code" />
          </button>
          <button
              @click="toggleQuote()"
              :title="__('Quote')"
              class="rounded px-1" :class="[activeNodes['Blockquote'] ? 'bg-stone-900 text-white' : '']"
          >
            <v-icon name="fa-quote-left" />
          </button>
          <button
              :title="__('Capture')"
          >
            <v-icon name="fa-camera" class="text-slate-300"/>
          </button>
        </div>
        <div class="flex w-full p-2 justify-end">
          <button
              :title="__('Preview')"
              @click="togglePreview"
              class="rounded px-1" :class="[preview ? 'bg-stone-900 text-white' : '']"
          >
          <v-icon name="bi-eye" />
          </button>
        </div>
    </div>
    <hr>
  <div id="editor" v-show="!preview" class="flex grow w-full overflow-y-auto overscroll-contain bg-white" />
  <div v-show="preview" class="flex grow w-full overflow-y-auto overscroll-contain bg-white" >
    <fix-html class="max-w-none text-stone-700 text-sm" :html="marked.parse(cm?.state.doc.toString() ?? '')" />
  </div>
</template>
