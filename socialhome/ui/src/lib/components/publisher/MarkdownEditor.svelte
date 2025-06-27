<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import EasyMDE from 'easymde';
  import 'easymde/dist/easymde.min.css';

  export let value: string = '';
  export let autofocus: boolean = false;
  export let placeholder: string = '';
  export let readonly: boolean = false;

  let editorEl: HTMLTextAreaElement;
  let editor: EasyMDE;
  const dispatch = createEventDispatcher();

  onMount(() => {
    editor = new EasyMDE({
      element: editorEl,
      initialValue: value,
      spellChecker: false,
      autoDownloadFontAwesome: false,
      placeholder,
      autofocus,
      readOnly: readonly,
      toolbar: readonly ? false : [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', '|',
        'preview', 'side-by-side', 'fullscreen'
      ],
    });

    if (!readonly) {
      editor.codemirror.on('change', () => {
        value = editor.value();
        dispatch('input', value);
      });
    }
  });
</script>

<div class="markdown-editor">
  <textarea bind:this={editorEl} style="display: none;"></textarea>
  {#if !readonly}
    <small class="text-xs text-gray-400 block mt-2">
      You can use markdown. Use the buttons above or type manually.
    </small>
  {/if}
</div>

<style>
  .markdown-editor :global(.EasyMDEContainer) {
    border: 1px solid #ccc;
    border-radius: 0.375rem;
  }
</style>
