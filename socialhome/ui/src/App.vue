<script setup>
import Toast from 'primevue/toast'
import ConfirmDialog from "primevue/confirmdialog"
import NavigationBar from '@/components/NavigationBar.vue'
import TabManager from "@/components/TabManager.vue";

</script>

<template>
  <main>
    <div class="flex flex-col size-screen min-h-dvh max-h-dvh overflow-clip overscroll-none bg-stone-200">
      <ConfirmDialog />
      <Toast />
      <NavigationBar />
      <TabManager />
    </div>
  </main>
</template>

