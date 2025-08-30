<script setup>
  import { computed, ref } from 'vue'
  import { storeToRefs } from "pinia"
  import { Button, Checkbox, Drawer, Message, Select } from "primevue"
  import { useGettext } from "vue3-gettext"
  import { apiFetch } from "@/helpers/utils"
  import { useAuthStore } from "@/stores/auth.js"

  
  const visible = defineModel('visible')
  const { $gettext } = useGettext()
  const { getAuthenticatedUserPreferences } = useAuthStore()
  const { CSRFToken, user } = storeToRefs(useAuthStore())
  
  const landingPages = [
    {id: 'profile', label: $gettext('Profile')},
    {id: 'profile_all', label: $gettext('Profile - all content')},
    {id: 'followed', label: $gettext('Followed stream')},
    {id: 'local', label: $gettext('Local stream')},
    {id: 'public', label: $gettext('Public stream')},
    {id: 'tags', label: $gettext('Tags stream')},
  ]

  
  const selectedLandingPage = ref(landingPages[2])

  const useNewUI = ref(true)
  
  const errorMessage = ref('')
  
  const initialPayload = ref('')
  const finalPayload = computed(() => JSON.stringify({
                        'generic__landing_page': selectedLandingPage.value.id,
                        'generic__use_new_ui': useNewUI.value
                       }))
  const hasChanges = computed(() => initialPayload.value !== finalPayload.value)
  const getPreferences = async () => {
    // refresh preferences
    await getAuthenticatedUserPreferences()
    console.log('preferences', user.value.preferences)
    // Django's dynamic preferences return an array with a complete description
    // of each preference. We could do something more fancy like generating dynamic
    // components based on the preference field type. For now, just loop through and
    // extract what we need
    user.value.preferences.results.forEach((pref) => {
      switch(pref.name) {
        case 'landing_page':
          selectedLandingPage.value = landingPages.find((page) => page.id === pref.value)
          break
        case 'use_new_ui':
          useNewUI.value = pref.value
          break
      }
    })
    initialPayload.value = JSON.stringify({
                      'generic__landing_page': selectedLandingPage.value.id,
                      'generic__use_new_ui': useNewUI.value
                     })
  }
  
  const loading = ref(false)
  const savePreferences = async () => {
    loading.value = true
    const options = {body: finalPayload.value, method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRFToken': CSRFToken.value}, credentials: "include"}
    const { errorMessage: error } = await apiFetch('/api/preferences/user/bulk/', options, (payload) => console.log('saved prefs', payload))
    if (!error) {
      visible.value = false
      hasChanges.value = false
      initialPayload.value = ''
    } else errorMessage.value = error
    loading.value = false
  }

</script>

<template>
  <Drawer v-model:visible="visible" position="top" :header="__('Preferences')" class="!h-min !w-fit text-sm" @show="getPreferences">
    <div class="flex flex-col">
      <div class="my-2 p-2 border rounded">
        <div class="flex space-x-2 items-center">
          <span>{{ __('Landing page') }}:</span>
          <Select v-model="selectedLandingPage" checkmark :options="landingPages" optionLabel="label"
            labelClass="text-sm"  class="hidden border-none shadow-lg md:flex" />
        </div>
        <span class="text-xs italic">{{ __('Choose which page you want to see as the landing page') }}</span>
      </div>
      <div class="p-2 border rounded">
        <div class="flex space-x-4 items-center">
          <span>{{ __('Try the new UI') }}:</span>
          <Checkbox v-model="useNewUI" :binary="true"/>
        </div>
        <span class="text-xs italic">{{ __('Uncheck to revert to the legacy UI (browser refresh required)') }}</span>
        </div>
      <Message v-if="errorMessage"
               severity="error"
               :life="5000"
               @life-end="errorMessage=''"
               class="mb-1 flex w-full justify-end">
        {{ errorMessage }}
      </Message>
      <Button text :label="__('Save')" :loading="loading" @click="savePreferences" icon="pi pi-save" :disabled="!hasChanges"
        class="!w-max !mt-2 bg-stone-200 text-stone-700 place-self-center"/>
    </div>
  </Drawer>
</template>
