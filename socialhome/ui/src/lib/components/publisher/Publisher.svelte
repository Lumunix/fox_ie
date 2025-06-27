<script lang="ts">
  import { onMount } from 'svelte';
  import MarkdownEditor from '$lib/components/publisher/MarkdownEditor.svelte';
  import { streamStore } from '$lib/stores/stream';

  let baseModel = { text: '' };
  let extendedModel = {
    visibility: 'public',
    pinned: false,
    includeFollowing: false
  };
  let wasValidated = false;
  let errors = {
    recipientsErrors: '',
    includeFollowingErrors: ''
  };

  const visibilityOptions = [
    { text: 'Public', value: 'public', help: 'Visible to everyone' },
    { text: 'Limited', value: 'limited', help: 'Only visible to selected followers' }
  ];

  function onPostForm(event: Event) {
    event.preventDefault();
    wasValidated = true;
    if (!baseModel.text.trim()) return;

    const post = {
      text: baseModel.text,
      visibility: extendedModel.visibility,
      pinned: extendedModel.pinned,
      includeFollowing: extendedModel.includeFollowing
    };

    streamStore.publish(post);
    baseModel.text = '';
  }
</script>

<form class="space-y-4" on:submit={onPostForm}>
  <h1 class="text-lg font-semibold">New Post</h1>
  <MarkdownEditor bind:value={baseModel.text} />

  <div>
    <label class="block font-medium mb-1" for="visibility">Visibility</label>
    <select
      id="visibility"
      class="w-full border rounded px-3 py-2"
      bind:value={extendedModel.visibility}
    >
      {#each visibilityOptions as opt (opt.value)}
        <option value={opt.value}>{opt.text}</option>
      {/each}
    </select>
    <ul class="text-sm text-gray-500 mt-1">
      {#each visibilityOptions as v (v.value)}
        <li>{v.text} — {v.help}</li>
      {/each}
    </ul>
    <p class="text-xs text-gray-400">Select who can see this post.</p>
  </div>

  {#if extendedModel.visibility === 'limited'}
    <div class="space-y-2">
      <p class="text-sm text-gray-600">Choose recipient rules:</p>
      <label class="inline-flex items-center gap-2">
        <input
          type="checkbox"
          bind:checked={extendedModel.includeFollowing}
          name="include_following"
        />
        Include followers
      </label>
      {#if errors.includeFollowingErrors}
        <p class="text-red-500 text-sm">{errors.includeFollowingErrors}</p>
      {/if}
    </div>
  {/if}

  <div class="flex items-center justify-between">
    <label class="inline-flex items-center gap-2">
      <input
        type="checkbox"
        bind:checked={extendedModel.pinned}
        name="pinned"
      />
      Pin this post
    </label>
    <button
      type="submit"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Post
    </button>
  </div>
</form>
