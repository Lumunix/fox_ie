<template>
    <TransitionRoot appear :show="showForm" as="template">
        <Dialog as="div" @close="closeForm()" class="relative z-30">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" class="p-4 text-xl font-medium leading-6 text-stone-900">
                                {{ __('Please Login') }}
                            </DialogTitle>
                            <div class="flex flex-col space-y-2">
                                <input v-bind="username" :placeholder="__('Enter user name')" />
                                <span class="text-red-900">{{ errors.username }}</span>
                                <input v-bind="password" :placeholder="__('Enter password')" type="password" @keyup.enter="onSubmit" />
                                <span class="text-red-900">{{ errors.password }}</span>
                            </div>
                            
                            <div class="mt-4">
                                <button type="button"
                                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    @click="onSubmit" :disabled="isSubmitting">
                                    {{ isSubmitting ? __('In Progress...') : __('Login') }}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
  
<script setup>
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
} from '@headlessui/vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { useContentsStore } from '@/stores/contents.js'
import { useAuthStore } from '@/stores/auth.js'
import {storeToRefs} from "pinia"
import { useRouter } from 'vue-router'

defineProps(['showForm'])
const emit = defineEmits(['closeForm'])
const router = useRouter()


const { defineInputBinds, handleSubmit, isSubmitting, errors, resetForm } = useForm({
    validationSchema: yup.object({
        username: yup.string().required(),
        password: yup.string().required()
    })
})
const { resetContent } = useContentsStore()
const { login } = useAuthStore()
const { authError } = storeToRefs(useAuthStore())
const username = defineInputBinds('username')
const password = defineInputBinds('password')

const onSubmit = handleSubmit((values, { resetForm, setFieldError }) => {
  return login(username.value, password.value).then(() => {
    if (authError.value) {
      setFieldError('password', authError.value)
    } else {
      emit('closeForm')
      resetContent()
      resetForm()
      router.push({path: '/'})
    }
  })
})

function closeForm() {
    resetForm()
    emit("closeForm")
}
</script>
  
