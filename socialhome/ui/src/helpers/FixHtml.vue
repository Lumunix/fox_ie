<script setup>
// credits: https://kerkour.com/vuejs-3-router-links-dynamic-vhtml
import linkify from '@/helpers/linkify';
import { onMounted, ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
//import fitvids from "fitvids"

// props
const props = defineProps({
  html: {
    type: String,
    required: true,
  }
});

// events

// composables
const $router = useRouter();

// lifecycle
onMounted(() => {
  linkify(component.value, $router)
});

// variables
const component = ref(null);

// computed

// watch
watch(() => props.html, () => {
  nextTick(() => linkify(component.value, $router));
});
</script>

<template>
  <div ref="component" v-html="html" />
</template>
