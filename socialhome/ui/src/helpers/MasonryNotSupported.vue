<template>
  <div class="flex">
     <div v-for="(column, columnIndex) in (singleColumn || items.length === 0 ? [items] : columns)"
          :class="[singleColumn ? '' : 'flex flex-col gap-y-4 h-fit w-full sm:w-1/2 lg:w-1/3 2xl:w-1/4', columnIndex < columns.length - 1 ? 'pr-4' : '']"
          ref="columnItems"
          :key="columnIndex">
     	<slot :items="column"></slot>
      <slot v-if="columnIndex === columns.length - 1" name="filler"></slot>
     </div>
	</div>
</template>

<script setup>
import { nextTick, onActivated, onDeactivated, onMounted, onUpdated, ref, useTemplateRef, watch } from "vue"
import { storeToRefs } from "pinia"
import { useContentsStore } from "@/stores/contents"
import { useIntervalFn } from '@vueuse/core'

// serialize async calls with a dumb scheduler...
const taskQueue = []
const { pause, resume } = useIntervalFn(() => {
     if (taskQueue.length === 0) return
     console.log('>>> run task')
     pause()
     const job  = taskQueue.shift()
     job.task(job.arg).then(() => {
          resume()
     })
}, 100)

const { draggable, items } = defineProps(['draggable', 'items'])
const { singleColumn } = storeToRefs(useContentsStore());

const columns = ref([])
const columnRefs = useTemplateRef('columnItems')

const responsiveSizes = [640, 1024, 1536] // TODO: fetch this from Tailwindcss
const getColumnCount = () => {
     if (singleColumn.value) return 1
     const width = window.innerWidth
     let count = 1
     responsiveSizes.forEach((size) => {
          if (width > size) count++
          else return
     })
     return count
}

let cachedHeights = {}
let fillInfos
let updateInfos
const fillColumns = async (itemIndex) => {
     
     if (itemIndex >= items.length || document.getElementById(`c${items[itemIndex]}`)) return

     //console.log('fillInfos', itemIndex, fillInfos)
     const target = fillInfos.reduce((prev, cur) => 
          cur.height < prev.height
          ? cur
          : prev,
     )

     const column = +target.index
     const currentItem = columns.value[column][fillInfos[column].next]
     //console.log('cachedHeights currentItem', currentItem, cachedHeights[currentItem])
     if (currentItem !== undefined) {
          cachedHeights[currentItem] = document.getElementById(`c${currentItem}`)?.getBoundingClientRect().height
     }
     columns.value[column][fillInfos[column].next++] = items[itemIndex]

     await nextTick()
     const itemElement = document.getElementById(`c${items[itemIndex]}`)
     //console.log('itemElement', itemElement, items[itemIndex])
     const itemHeight = itemElement.getBoundingClientRect().height
     fillInfos[column].height += itemHeight

     await fillColumns(itemIndex+1)
}

const fillMasonry = async (itemIndex) => {
     console.log('in fillMasonry', itemIndex)
     unobserveColumns()
     const columnCount = getColumnCount()
     if (itemIndex === 0) {
          fillInfos = Array.from({ length: columnCount })
          for (let i=0; i < columnCount; i++) fillInfos[i] = {height: 0, index: i, next: 0}
     } else {
          if (updateInfos) fillInfos = structuredClone(updateInfos)
          //console.log('fill from updateInfos', structuredClone(fillInfos))
     }
     await fillColumns(itemIndex)
     observeColumns()
     console.log('out fillMasonry', columnRefs.value)
}

let columnUpdates
const updateColumns = async (itemIndex) => {
     if (itemIndex >= items.length) return

     const target = updateInfos.reduce((prev, cur) =>
          cur.height < prev.height
          ? cur
          : prev,
     )

     const column = +target.index
     cachedHeights[items[itemIndex]] = document.getElementById(`c${items[itemIndex]}`)?.getBoundingClientRect().height
     if (columns.value[column].length > updateInfos[column].next) {
          const cacheItem = columns.value[column][updateInfos[column].next]
          //console.log('updateColumns', column, cacheItem, items[itemIndex], itemIndex, updateInfos[column].next, updateInfos, columns.value[column])
          cachedHeights[cacheItem] = document.getElementById(`c${cacheItem}`).getBoundingClientRect().height
     }
     columns.value[column][updateInfos[column].next++] = items[itemIndex]
     if (!cachedHeights[items[itemIndex]]) {
          await nextTick()
          cachedHeights[items[itemIndex]] = document.getElementById(`c${items[itemIndex]}`).getBoundingClientRect().height
     }
     //console.log('cachedHeights', cachedHeights)
     //console.log('itemHeight', cachedHeights[items[itemIndex]], items[itemIndex])
     updateInfos[column].height += cachedHeights[items[itemIndex]]
     //console.log('itemHeight', items[itemIndex], itemHeight, updateInfos[target.index].height, target.index, items.length, columnUpdates[target.index])
     await updateColumns(itemIndex + 1)
}

const queueMasonryUpdate = () => taskQueue.push({task: updateMasonry, arg: undefined})

const updateMasonry = async (unused) => {
     console.log('in updateMasonry', 0)
     unobserveColumns()
     const columnCount = getColumnCount()
     updateInfos = Array.from({ length: columnCount })
     for (let i=0; i < columnCount; i++) {
          updateInfos[i] = {height: 0, index: i, next: 0}
          if (columns.value[i] === undefined) columns.value[i] = []
     }
     await updateColumns(0)
     //console.log('updateInfos', updateInfos, columns.value)

     for (let i=0; i < columnCount; i++) {
          //const column = columnUpdates[i]
          //if (columns.value[i] === undefined) columns.value[i] = []
          //for (let j=0; j < column.length; j++) {
          //     columns.value[i][j] = column[j]
          //}
          columns.value[i].length = updateInfos[i].next
          //console.log('column info length', i, updateInfos[i].height )
     }
     columns.value.length = columnCount
     observeColumns()
     console.log('out updateMasonry', columnRefs.value)
}

let prevWidth = 0
let prevHeight = 0
let timeOut
const resizeObserver = new ResizeObserver((entries) => {
     const width = entries[0].contentBoxSize[0].inlineSize
     const height = entries[0].contentBoxSize[0].blockSize
     console.log('observer', prevWidth, width, prevHeight, height)
     clearTimeout(timeOut)
     if (columns.value.length !== getColumnCount()) taskQueue.push({task: updateMasonry, arg: undefined})
     else if (prevWidth !== width || prevHeight !== height) timeOut = setTimeout(() => taskQueue.push({task: updateMasonry, arg: undefined}), 250)
     prevWidth = width
     prevHeight = height
})
const observeColumns = () => columnRefs.value.forEach(column => resizeObserver.observe(column))
const unobserveColumns = () => columnRefs.value.forEach(column => resizeObserver.unobserve(column))

onMounted(() => {
     columns.value = Array.from({ length: getColumnCount() }).map(() => [])
     taskQueue.push({task: fillMasonry, arg: 0})
     console.log('masonry mounted')
     onActivated(() => {
          console.log('masonry activated')
          taskQueue.push({task: updateMasonry, arg: undefined})
          resume()
     })
})
onDeactivated(() => {
     pause()
     unobserveColumns()
})
watch(() => items, (newItems, oldItems) => {
     if (newItems.length === 0) {
          columns.value = Array.from({ length: getColumnCount() }).map(() => [])
          return
     }
     if (draggable) taskQueue.push({task: updateMasonry, arg: undefined})
     else if (oldItems[0] === newItems[0]) taskQueue.push({task: fillMasonry, arg: oldItems.length})
     else taskQueue.push({task: fillMasonry, arg: 0})
})

//defineExpose({queueMasonryUpdate})
</script>
