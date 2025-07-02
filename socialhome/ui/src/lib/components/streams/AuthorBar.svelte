<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ContentTimestamp from '$lib/components/streams/ContentTimestamp.svelte';
  import ProfileReactionButtons from '$lib/components/common/ProfileReactionButtons.svelte';
  import { Popover, PopoverTrigger, PopoverContent } from '@skeletonlabs/skeleton';

  export let content: any;

  const dispatch = createEventDispatcher();

  const author = content.author;
  const throughAuthor = content.through_author;

  const authorName = author?.name || author?.handle || author?.fid;
  const authorId = author?.finger || author?.handle || author?.fid;

  const throughAuthorName = throughAuthor?.name || throughAuthor?.handle || throughAuthor?.fid;
  const throughAuthorId = throughAuthor?.finger || throughAuthor?.handle || throughAuthor?.fid;

  const isShared = !!throughAuthor;

  const onImageError = () => {
    console.warn('Profile image failed to load');
  };

  const handleKeyDown = (event: KeyboardEvent, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      callback();
    }
  };
</script>

<div class="grid-item-author-bar mt-1 flex gap-3 items-start">
  <img
    src={author?.image_url_small}
    alt="author avatar"
    class="grid-item-author-bar-pic rounded-full w-10 h-10 object-cover"
    on:error={onImageError}
  />

  <div class="author-bar-name-container">
    <Popover>
      <PopoverTrigger>
        <button
          type="button"
          class="cursor-pointer font-medium"
        >
          {@html authorName}
        </button>
      </PopoverTrigger>
      <PopoverContent class="p-2 bg-white border rounded shadow">
        <div>{authorId}</div>
        <ProfileReactionButtons profileUuid={author?.uuid} />
      </PopoverContent>
    </Popover>

    <ContentTimestamp {content} />

    {#if isShared}
      <div class="mt-2">
        <Popover>
          <PopoverTrigger>
            <button
              type="button"
              class="cursor-pointer flex items-center text-sm text-gray-500"
            >
              <i class="fa fa-refresh mr-2 shared-icon" aria-hidden="true"></i>
              <span class="ml-1">
                {@html throughAuthorName}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent class="p-2 bg-white border rounded shadow">
            <div>{throughAuthorId}</div>
            <ProfileReactionButtons profileUuid={throughAuthor?.uuid} />
          </PopoverContent>
        </Popover>
      </div>
    {/if}
  </div>
</div>

<style>
  .grid-item-author-bar-pic {
    border: 1px solid #ccc;
  }
</style>
