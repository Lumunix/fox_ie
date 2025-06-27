<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import AuthorBar from '$lib/components/streams/AuthorBar.svelte';
  import NsfwShield from '$lib/components/streams/NsfwShield.svelte';
  import ReactionsBar from '$lib/components/streams/ReactionsBar.svelte';
  import ContentTimestamp from '$lib/components/streams/ContentTimestamp.svelte';

  export let content: any;

  const dispatch = createEventDispatcher();

  let isAuthenticated = true; // TODO: Replace with real auth check

  $: disableLoadMore = !content.hasLoadMore;

  $: showAuthorBar =
    content.content_type === 'reply' ||
    (isAuthenticated && !content.user_is_author) ||
    true; // fallback

  $: updateUrl = `/content/update/${content.id}`;
  $: deleteUrl = `/content/delete/${content.id}`;

  $: translations = {
    delete: 'Delete',
    update: 'Update'
  };

  const loadMore = () => {
    dispatch('loadmore');
  };
</script>

<div>
  {#if content.hasLoadMore}
    <div on:click={loadMore} class="cursor-pointer text-center text-sm text-gray-500">
      Load more...
    </div>
  {/if}

  {#if showAuthorBar}
    <AuthorBar {content} />
  {/if}

  {#if content.is_nsfw}
    <NsfwShield {tags}={content.tags}>
      <div id={"c" + content.id}>{@html content.rendered}</div>
    </NsfwShield>
  {:else}
    <div id={"c" + content.id}>{@html content.rendered}</div>
  {/if}

  <ReactionsBar {content}>
    {#if !showAuthorBar}
      <div class="stream-element-content-timestamp mr-2">
        <ContentTimestamp {content} />
      </div>
    {/if}
    <div class="mt-1 grid-item-bar-links">
      {#if content.user_is_author}
        <a href={updateUrl} title={translations.update} aria-label={translations.update}>
          <i class="fa fa-pencil" />
        </a>
        <a href={deleteUrl} title={translations.delete} aria-label={translations.delete}>
          <i class="fa fa-remove" />
        </a>
      {/if}
    </div>
  </ReactionsBar>
</div>

<style>
  .grid-item-bar-links a {
    margin-right: 0.5rem;
  }
</style>
