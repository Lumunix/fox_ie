<script lang="ts">
  import MarkdownEditor from '$lib/components/publisher/MarkdownEditor.svelte';
  import { createEventDispatcher } from 'svelte';

  export let initialText: string = '';
  export let postId: string | number;

  let text = initialText;
  const dispatch = createEventDispatcher();

  function saveEdit() {
    dispatch('save', { id: postId, text });
  }
</script>

<div class="space-y-4">
  <h2 class="text-lg font-semibold">Edit Post</h2>

  <MarkdownEditor bind:value={text} autofocus={true} placeholder="Edit your post..." />

  <div class="flex justify-end gap-2">
    <button
      class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
      type="button"
      on:click={() => dispatch('cancel')}
    >
      Cancel
    </button>
    <button
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      type="button"
      on:click={saveEdit}
    >
      Save Changes
    </button>
  </div>
</div>
