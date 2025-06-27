<script lang="ts">
  import { streamStore } from '$lib/stores/stream';

  export let contentType: string;
  export let toggleReplyEditor: () => void = () => {};

  $: showReplyAction = streamStore.isAuthenticated && contentType !== 'share';
</script>

{#if showReplyAction}
  <button
    class="reaction-icons text-blue-600 hover:underline flex items-center gap-1"
    on:click|preventDefault={toggleReplyEditor}
    title="Reply"
    aria-label="Reply"
  >
    <i class="fa fa-comment"></i>
    <span>Reply</span>
  </button>
{/if}
