<script lang="ts">
  import EditPublisher from '$lib/components/publisher/EditPublisher.svelte';
  import EditReplyPublisher from '$lib/components/publisher/EditReplyPublisher.svelte';

  export let context: 'post' | 'reply';
  export let id: string | number;
  export let text: string;

  /**
   * Emits events from child editors
   */
  function handleSave(event) {
    dispatch('save', event.detail);
  }

  function handleCancel() {
    dispatch('cancel');
  }

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

{#if context === 'post'}
  <EditPublisher
    initialText={text}
    postId={id}
    on:save={handleSave}
    on:cancel={handleCancel}
  />
{:else if context === 'reply'}
  <EditReplyPublisher
    initialText={text}
    replyId={id}
    on:save={handleSave}
    on:cancel={handleCancel}
  />
{/if}
