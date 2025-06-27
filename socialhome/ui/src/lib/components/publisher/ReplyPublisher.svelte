<script lang="ts">
  import MarkdownEditor from '$lib/components/publisher/MarkdownEditor.svelte';
  import { createEventDispatcher } from 'svelte';

  export let parentId: string | number;
  export let placeholder: string = 'Write a reply...';

  let text = '';
  const dispatch = createEventDispatcher();

  function sendReply() {
    if (!text.trim()) return;
    dispatch('submit', { parentId, text });
    text = '';
  }
</script>

<div class="space-y-3">
  <MarkdownEditor bind:value={text} placeholder={placeholder} />

  <div class="flex justify-end">
    <button
      type="button"
      on:click={sendReply}
      class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Reply
    </button>
  </div>
</div>
