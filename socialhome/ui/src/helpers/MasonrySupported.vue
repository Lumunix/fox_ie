<template>
    <div  style="grid-template-rows: masonry"
         :class="[
              singleColumn
                ? ''
                : `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-min`,
              'ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none',
              draggable ? 'overflow-y-auto overscroll-contain' : ''
            ]"

    >
		<slot :items="items"></slot>
    <slot name="filler"></slot>
	</div>
</template>

<script setup>
import { ref } from "vue"
import {storeToRefs} from "pinia"
import { useContentsStore } from "@/stores/contents"

const { draggable, items } = defineProps(['draggable', 'items'])
const { singleColumn } = storeToRefs(useContentsStore());
</script>
