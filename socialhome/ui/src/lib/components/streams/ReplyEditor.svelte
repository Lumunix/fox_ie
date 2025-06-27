<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { streamStore } from '$lib/stores/stream';

  export let contentId: number;
  export let contentVisibility: string;
  export let prefilledText: string = '';
  export let toggleReplyEditor: () => void = () => {};

  const dispatch = createEventDispatcher();

  let replyText = prefilledText;

  $: fullEditorUrl = `/content/reply/${contentId}`;

  $: translations = {
    fullEditor: 'Full editor',
    replySave: 'Reply',
    replyText: 'Reply text...'
  };

  const saveReply = () => {
    if (replyText.trim()) {
      const re = /@([\w\-.]+@[\w\-.]+\.[A-Za-z0-9]+)[\W\s]?/g;
      const recipients = Array.from(replyText.matchAll(re), m => m[1]);

      streamStore.saveReply({
        parent: contentId,
        text: replyText,
        recipients
      });

      replyText = '';
      toggleReplyEditor();
    }
  };
</script>

<div class="mt-2">
  <textarea
    bind:value={replyText}
    rows={5}
    placeholder={translations.replyText}
    autofocus
    class="w-full p-2 border rounded resize-none text-sm"
  ></textarea>

  <div class="text-right mt-2 text-sm">
    <a
      href={fullEditorUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="text-blue-500 hover:underline"
    >
      {translations.fullEditor}
    </a>
  </div>

  <div class="reply-save-button mt-2">
    <button
      class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      on:click|preventDefault={saveReply}
    >
      {translations.replySave}
    </button>
  </div>
</div>
