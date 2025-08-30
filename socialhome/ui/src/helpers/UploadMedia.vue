<script setup>
import { computed, onUpdated, reactive, ref } from 'vue'
import { storeToRefs} from "pinia"
import { useAuthStore} from "@/stores/auth"
import { Button, Checkbox, Dialog, FileUpload, Message, RadioButton } from "primevue"
import {apiFetch} from "@/helpers/utils"
import {useFetch} from "@vueuse/core"
import { useGettext } from "vue3-gettext"
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const emit = defineEmits(['hide', 'mediaUploaded'])
const { $gettext } = useGettext()
const visible = defineModel('visible')
const { cropperOptions,
        info,
        title,
        uploadOnly } = defineProps({cropperOptions: {type: Object},
                                    info: {type: Object},
                                    title: {type: String},
                                    uploadOnly: {type: Boolean}})
let mediaInfo = reactive(Object.assign({}, info))
let canvasOptions = reactive(Object.assign({}, cropperOptions?.canvas))
const authStore = useAuthStore()
const CSRFToken = computed(() => {return authStore.CSRFToken})
const mediaUpload = ref(true)
const mediaError = ref('')
const fileUploader = ref()
const loadingMedia = ref(false)

const cropper = ref()
const defaultCropperSize = ({visibleArea, imageSize}) => {
  const size = {width: (visibleArea || imageSize)?.width,
          height: (visibleArea || imageSize)?.height}
  console.log('defaultSize', size)
  return size
}
const keepImageSize = ref(false)

const mediaUploader = async () => {
  const upload = async (mediaType) => {
    loadingMedia.value = true
    const { errorMessage } = await apiFetch('/api/media-upload/',
        {
          credentials: 'include',
          headers: {
            'X-CSRFToken': CSRFToken.value,
          },
          body: formData,
          method: 'POST'
        }, (payload) => {
          mediaInfo.url = payload.media
          mediaInfo.type = mediaType
          fileUploader.value.clear()
          if (imageBlob.value) URL.revokeObjectURL(imageBlob.value.src)
          imageBlob.value.src = payload.media
          emit('mediaUploaded', {...mediaInfo})        })
    loadingMedia.value = false
    mediaError.value = errorMessage
  }

  const formData = new FormData()
  if (info.category) formData.append('category', info.category)
  if (imageBlob.value.src) {
    const { canvas } = cropper.value.getResult()
    //mediaType = imageBlob.value.type
    canvas.toBlob(async blob => {
      if (!imageBlob.value.name) {
        const url = imageBlob.value.src.split('/')
        imageBlob.value.name = url[url.length - 1]
      }
      formData.append('media', blob, imageBlob.value.name)
      await upload(blob.type)
    }, imageBlob.value.type)
  } else {
    const file = fileUploader.value?.files[0] ?? info.droppedFile
    if (file) {
      formData.append('media', file, file.name)
      await upload(file.type)
    } else mediaError.value = 'No media'

  }
}

  const setMedia = async () => {
    console.log('uploadmedia setmedia')
    if (mediaUpload.value) {
      await mediaUploader()
      return
    }
    console.log('uploadmedia setmedia', mediaInfo)
    if (!mediaInfo.url) {
        mediaError.value = $gettext('No media URL')
        return
    }
    if (!mediaInfo.type) {
      const { data, error } = await useFetch(mediaInfo.url).head().blob()
      if (error.value) {
        mediaError.value = error.value
        mediaInfo.type = ''
      } else {
        mediaInfo.type = data.value.type
      }
    }
    emit('mediaUploaded', {...mediaInfo})
  }

  const imageBlob = ref(mediaInfo?.url ? {src: mediaInfo.url} : {})
  const fileSelect = (event) => {
    if (imageBlob.value) URL.revokeObjectURL(imageBlob.value.src)
    const file = event.files[0]
    imageBlob.value = {type: file.type, name: file.name}
    if (fileUploader.value.getTypeClass(file.type) === 'image')
      imageBlob.value['src'] = URL.createObjectURL(file)
  }

  const resetMedia = () => {
    mediaInfo = reactive(Object.assign({}, info))
    canvasOptions = reactive(Object.assign({}, cropperOptions?.canvas))
    keepImageSize.value = false
    if (imageBlob.value) URL.revokeObjectURL(imageBlob.value.src)
    imageBlob.value = mediaInfo?.url ? {src: mediaInfo.url} : {}
    if (mediaInfo?.url && !uploadOnly) mediaUpload.value = false
  }

  const toggleImageSize = () => {
    if (keepImageSize.value) Object.assign(canvasOptions, {maxWidth: 0, maxHeight:0})
    else canvasOptions = reactive(Object.assign({}, cropperOptions?.canvas))
  }

  onUpdated(() => {
    if (visible.value) resetMedia()
    if (info.droppedFile) {
      imageBlob.value = {type: info.type, name: info.droppedFile.name}
      if (info.type.split('/')[0] === 'image')
        imageBlob.value['src'] = URL.createObjectURL(info.droppedFile)
    }
  })
</script>

<template>
  <Dialog ref="mediaPanel" v-model:visible="visible" :header="title" @hide="emit('hide')" @after-hide="resetMedia"
          :pt="{header: 'p-2 border-b-2', title: 'italic text-md font-medium', root: 'w-screen sm:w-fit'}"
  >
    <div class="flex w-full flex-col justify-center space-y-1 sm:w-96">
      <div v-if="!uploadOnly" class="flex flex-row justify-center gap-3 p-2 text-sm">
        <div class="flex items-center">
          <RadioButton v-model="mediaUpload" inputId="url" :value="false" name="media" />
          <label for="url" class="ml-2">{{ __('Enter url') }}</label>
        </div>
        <div class="flex items-center">
          <RadioButton v-model="mediaUpload" inputId="upload" :value="true" name="media" />
          <label for="upload" class="ml-2">{{ __('Upload media') }}</label>
        </div>
      </div>
      <FileUpload v-if="mediaUpload"
                  ref="fileUploader"
                  :multiple="false"
                  :showUploadButton="false"
                  :showCancelButton="false"
                  name="demo[]"
                  :accept="mediaInfo.accept"
                  customUpload
                  @select="fileSelect"
                  :pt="{root: 'text-sm', header: 'h-12 overflow-hidden text-clip', content: 'hidden'}"
      >
        <template #header="{ chooseCallback, files }">
          <div class="flex space-x-2 items-center justify-center ">
            <Button @click="chooseCallback()"
              icon="pi pi-images" rounded outlined severity="secondary"></Button>
            <span class="text-sm">{{ files[0]?.name ?? mediaInfo.droppedFile?.name ?? 'No selection'}}</span>
          </div>
        </template>
      </FileUpload>
      <input v-else
             v-model.lazy.trim="mediaInfo.url"
             type="url"
             pattern="(https|ftp)://.*"
             :placeholder="__('Enter media url')"
             class="rounded p-1 ring-1 ring-black/5 placeholder:italic"
      />
      <Cropper ref="cropper" v-if="imageBlob.src && mediaUpload" :src="imageBlob.src" class="h-96"
               :canvas="canvasOptions" :stencilProps="cropperOptions?.stencilProps" :default-size="defaultCropperSize"
      />
      <div v-if="imageBlob.src && mediaUpload" class="hidden items-center p-2 align-middle shadow-lg md:flex">
        <Checkbox v-model="keepImageSize" inputId="keepImageSize" :binary="true" @change="toggleImageSize"/>
        <label for="keepImageSize" class="ml-2 whitespace-nowrap text-sm">{{ __("Keep original size") }}</label>
      </div>
      <textarea v-model.lazy.trim="mediaInfo.description" :placeholder="__('Enter media description')" class="h-16 rounded p-1 ring-1 ring-black/5 placeholder:italic" />
      <Message v-if="mediaError"
               severity="error"
               :life="5000"
               @life-end="mediaError=''"
               class="mb-1 flex w-full justify-end">
        {{ mediaError }}
      </Message>
      <div class="flex justify-end space-x-4 p-1 text-sm">
        <Button type="button" label="Ok" :loading="loadingMedia" text icon="pi pi-upload"
                @click="setMedia" />
        <Button type="button" :label="__('Help')" text icon="pi pi-question" />
      </div>
    </div>
  </Dialog>
</template>
