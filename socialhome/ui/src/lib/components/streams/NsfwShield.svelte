<script lang="ts">
  export let tags: string[] = [];

  let showNsfwContent = false;

  $: nsfwBtnText = showNsfwContent
    ? '[Hide NSFW content]'
    : '[Show NSFW content]';

  const toggleNsfwShield = (event: Event) => {
    event.preventDefault();
    showNsfwContent = !showNsfwContent;
  };
</script>

<div class="text-center border border-dashed border-red-400 p-4 rounded">
  {#if !showNsfwContent}
    <button
      class="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
      on:click={toggleNsfwShield}
    >
      {nsfwBtnText}
    </button>
  {:else}
    <a
      href="#"
      class="block mb-2 text-sm text-red-500 hover:underline"
      on:click={toggleNsfwShield}
    >
      {nsfwBtnText}
    </a>
  {/if}

  {#if !showNsfwContent && tags.length > 0}
    <div class="mt-2 mb-2">
      {#each tags as tag (tag)}
        <a href={`/tag/${tag}`} class="text-blue-500 hover:underline mr-2">
          #{tag}
        </a>
      {/each}
    </div>
  {/if}

  {#if showNsfwContent}
    <slot />
  {/if}
</div>

<style>
  button {
    font-weight: 500;
  }
</style>
