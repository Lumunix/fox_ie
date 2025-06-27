<script lang="ts">
  import { onMount } from 'svelte';
  import { streamStore } from '$lib/stores/stream';
  import StreamElement from '$lib/components/streams/StreamElement.svelte';
  import RepliesContainer from '$lib/components/streams/RepliesContainer.svelte';

  export let content: any;

  $: isPost = content.content_type === 'content';
  $: isReply = content.content_type === 'reply';
  $: isContent = isPost || isReply;
  $: replies = streamStore.getReplies(content);
  $: shares = streamStore.getShares(content.id);
  $: showSpinner = isPost && streamStore.pending.replies && content.reply_count > 0;

  onMount(() => {
    if (isPost) {
      streamStore.fetchReplies(content.id);
      streamStore.fetchShares(content.id);
    }
  });
</script>

<div>
  <div class={`replies-container ${isReply ? 'border-l-2 border-gray-700 pl-3' : ''}`}>
    {#each replies as reply (reply.id)}
      <StreamElement class="reply" id={`r${reply.id}`} content={reply} />
    {/each}
  </div>

  {#if showSpinner}
    <div class="text-center h-[42px]">
      <i class="fa fa-spinner fa-spin fa-2x" aria-hidden="true"></i>
    </div>
  {/if}

  {#if isContent}
    {#each shares as share (share.id)}
      <RepliesContainer {content}={share} />
    {/each}
  {/if}
</div>
