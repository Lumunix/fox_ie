<script lang="ts">
  import ReplyButton from '$lib/components/buttons/ReplyButton.svelte';
  import ShareButton from '$lib/components/buttons/ShareButton.svelte';
  import ReplyEditor from '$lib/components/streams/ReplyEditor.svelte';
  import RepliesContainer from '$lib/components/streams/RepliesContainer.svelte';

  export let content: any;

  let replyEditorActive = false;
  let showRepliesBox = false;

  const toggleReplyEditor = () => {
    replyEditorActive = !replyEditorActive;
  };

  $: rootParent = (() => {
    if (content.content_type !== 'reply') return content;
    let ref = content;
    while (ref?.parent) ref = ref.parent;
    return ref;
  })();

  $: translations = {
    shares: 'Shares',
    replies: 'Replies'
  };
</script>

<div class="grid-item-bar flex flex-wrap items-center gap-2">
  <slot />

  <ReplyButton
    contentType={content.content_type}
    toggleReplyEditor={toggleReplyEditor}
  />

  <ShareButton
    {content}
    parentVisibility={rootParent?.visibility}
  />

  <div class="ml-auto mt-1 flex gap-3 items-center">
    {#if content.shares_count > 0}
      <span title={translations.shares} aria-label={translations.shares} class="reaction-icons">
        <i class="fa fa-refresh"></i>
        <span class="reaction-counter">{content.shares_count}</span>
      </span>
    {/if}

    {#if content.reply_count > 0}
      <button
        class="reaction-icons hover:underline"
        title={translations.replies}
        aria-label={translations.replies}
        on:click={() => (showRepliesBox = !showRepliesBox)}
      >
        <i class="fa fa-comments"></i>
        <span class="reaction-counter">{content.reply_count}</span>
      </button>
    {/if}
  </div>
</div>

{#if replyEditorActive}
  <ReplyEditor
    contentId={content.id}
    contentVisibility={content.visibility}
    prefilledText={''}
    toggleReplyEditor={toggleReplyEditor}
  />
{/if}

{#if showRepliesBox}
  <RepliesContainer {content} />
{/if}

<style>
  .reaction-icons {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  .reaction-counter {
    margin-left: 0.25rem;
  }
</style>
