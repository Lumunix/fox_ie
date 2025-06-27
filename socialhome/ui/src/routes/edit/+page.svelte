<script lang="ts">
  import EditDispatcher from '$lib/components/publisher/EditDispatcher.svelte';
  import { page } from '$app/stores';
  import { onDestroy } from 'svelte';

  let context = 'post';
  let id = '';
  let text = '';

  const unsubscribe = page.subscribe(($page) => {
    context = $page.url.searchParams.get('context') || 'post';
    id = $page.url.searchParams.get('id') || '';
    text = decodeURIComponent($page.url.searchParams.get('text') || '');
  });

  onDestroy(unsubscribe);

  function handleSave(event) {
    console.log('Edited:', event.detail);
  }
</script>

<main class="p-4 max-w-3xl mx-auto">
  <h1 class="text-2xl font-bold mb-4">Edit {context}</h1>
  {#if id && text}
    <EditDispatcher
      {context}
      id={id}
      text={text}
      on:save={handleSave}
      on:cancel={() => history.back()}
    />
  {:else}
    <p class="text-gray-500">Missing required parameters.</p>
  {/if}
</main>
