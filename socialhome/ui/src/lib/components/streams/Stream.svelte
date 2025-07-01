<script lang="ts">
  import { onMount } from 'svelte';
  import { streamStore } from '$lib/stores/stream';
  import StreamElement from '$lib/components/streams/StreamElement.svelte';
  import LoadingElement from '$lib/components/common/LoadingElement.svelte';
  import ProfileStreamButtons from '$lib/components/streams/stamped_elements/ProfileStreamButtons.svelte';

  // Dynamic component mapping (stubbed)

  import PublicStampedElement from '$lib/components/streams/stamped_elements/PublicStampedElement.svelte';
  import FollowedStampedElement from '$lib/components/streams/stamped_elements/FollowedStampedElement.svelte';
  import LimitedStampedElement from '$lib/components/streams/stamped_elements/LimitedStampedElement.svelte';
  import LocalStampedElement from '$lib/components/streams/stamped_elements/LocalStampedElement.svelte';
  import TagStampedElement from '$lib/components/streams/stamped_elements/TagStampedElement.svelte';
  import TagsStampedElement from '$lib/components/streams/stamped_elements/TagsStampedElement.svelte';
  import ProfileStampedElement from '$lib/components/streams/stamped_elements/ProfileStampedElement.svelte';

  const stampedComponents = {
    PublicStampedElement,
    FollowedStampedElement,
    LimitedStampedElement,
    LocalStampedElement,
    TagStampedElement,
    TagsStampedElement,
    ProfileStampedElement
  };

  let currentTime = new Date();

  $: single = $streamStore.single;
  $: hasNew = $streamStore.hasNewContent;
  $: contentList = $streamStore.currentContentList;
  $: pending = $streamStore.pending;

  const onNewContentClick = () => {
    streamStore.loadNewContent();
  };

  const loadStream = () => {
    streamStore.loadMore();
  };
</script>

<div class:container={single}>
  {#if hasNew}
    <div class="new-content-container">
      <button class="new-content-load-link" on:click={onNewContentClick}>
        <span class="badge badge-primary">New posts available</span>
      </button>
    </div>
  {/if}

  {#if single}
    <StreamElement class="grid-item grid-item-full" content={streamStore.singleContent} />
  {:else}
    <div class="stamped">
      <svelte:component this={stampedComponents[$streamStore.stampedType]} />
    </div>

    {#if $streamStore.showProfileStreamButtons}
      <div class="profile-stream-buttons">
        <ProfileStreamButtons />
      </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each contentList as content (content.id)}
        <StreamElement
          class="grid-item"
          content={content}
          on:loadmore={loadStream} />
      {/each}
    </div>
  {/if}

  {#if pending.contents}
    <LoadingElement />
  {/if}
</div>

<style>
  .new-content-container {
    text-align: center;
    margin: 1rem 0;
  }
  .new-content-load-link .badge {
    padding: 0.5rem 1rem;
  }
  .profile-stream-buttons {
    margin-bottom: 1rem;
  }
</style>
