<script lang="ts">
  import { streamStore } from '$lib/stores/stream';

  export let content: any;
  export let parentVisibility: string = 'public';

  $: showShareAction = streamStore.isAuthenticated && parentVisibility === 'public';
  $: isShared = content.user_has_shared;
  $: label = isShared ? 'Unshare' : 'Share';

  const toggleShare = () => {
    if (isShared) {
      streamStore.unshareContent(content.id);
    } else {
      streamStore.shareContent(content.id);
    }
  };
</script>

{#if showShareAction}
  <button
    class="reaction-icons text-blue-600 hover:underline flex items-center gap-1"
    on:click|preventDefault={toggleShare}
    title={label}
    aria-label={label}
  >
    <i class="fa fa-refresh"></i>
    <span>{label}</span>
  </button>
{/if}
