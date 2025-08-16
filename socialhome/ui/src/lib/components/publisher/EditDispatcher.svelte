<script lang="ts">
  export let contentId: string | undefined = undefined;

  let isLoading = true;
  let editContent = '';
  let originalContent = '';
  let isSaving = false;
  let hasChanges = false;

  // Mock content data
  const mockContent = {
    id: contentId || "123",
    content: "This is the original content that can be edited. It might be a post, comment, or any other editable content.",
    type: "post", // could be "post", "comment", "reply", etc.
    author: "current_user"
  };

  // Simulate loading content
  setTimeout(() => {
    originalContent = mockContent.content;
    editContent = mockContent.content;
    isLoading = false;
  }, 500);

  $: hasChanges = editContent !== originalContent;

  async function handleSave() {
    if (!hasChanges || !editContent.trim()) return;

    isSaving = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Saving edited content:', {
      contentId: mockContent.id,
      originalContent,
      newContent: editContent
    });

    originalContent = editContent;
    isSaving = false;

    alert('Content updated successfully!');
  }

  function handleCancel() {
    editContent = originalContent;
  }

  function handleDelete() {
    if (confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      console.log('Deleting content:', mockContent.id);
      alert('Content deleted successfully!');
    }
  }
</script>

<div class="edit-dispatcher-container">
  <h2>Edit {mockContent.type.charAt(0).toUpperCase() + mockContent.type.slice(1)}</h2>

  {#if isLoading}
    <div class="loading">
      <p>Loading content...</p>
    </div>
  {:else}
    <div class="edit-form">
      <div class="content-info">
        <p>Editing {mockContent.type} by <strong>@{mockContent.author}</strong></p>
        <p>Content ID: {mockContent.id}</p>
      </div>

      <textarea
        bind:value={editContent}
        placeholder="Edit your content..."
        rows="6"
      ></textarea>

      <div class="form-actions">
        <div class="left-actions">
          <button
            class="delete-btn"
            on:click={handleDelete}
          >
            Delete
          </button>
        </div>

        <div class="right-actions">
          <button
            class="cancel-btn"
            disabled={!hasChanges}
            on:click={handleCancel}
          >
            Cancel
          </button>
          <button
            class="save-btn"
            disabled={isSaving || !hasChanges || !editContent.trim()}
            on:click={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {#if hasChanges}
        <div class="changes-indicator">
          <p>⚠️ You have unsaved changes</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .edit-dispatcher-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  h2 {
    color: #333;
    margin-bottom: 20px;
  }

  .loading {
    text-align: center;
    color: #657786;
    padding: 40px;
  }

  .edit-form {
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    background: white;
  }

  .content-info {
    padding: 15px;
    background: #f7f9fa;
    border-bottom: 1px solid #e1e8ed;
    border-radius: 8px 8px 0 0;
  }

  .content-info p {
    margin: 5px 0;
    color: #657786;
    font-size: 0.9em;
  }

  textarea {
    width: 100%;
    border: none;
    padding: 15px;
    font-size: 1em;
    resize: vertical;
    min-height: 150px;
  }

  textarea:focus {
    outline: none;
    box-shadow: 0 0 0 2px #1da1f2;
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-top: 1px solid #e1e8ed;
  }

  .right-actions {
    display: flex;
    gap: 10px;
  }

  .save-btn, .cancel-btn, .delete-btn {
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  }

  .save-btn {
    background: #1da1f2;
    color: white;
  }

  .save-btn:hover:not(:disabled) {
    background: #1991da;
  }

  .save-btn:disabled {
    background: #aab8c2;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: #e1e8ed;
    color: #333;
  }

  .cancel-btn:hover:not(:disabled) {
    background: #d1d8dd;
  }

  .cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .delete-btn {
    background: #ff6b6b;
    color: white;
  }

  .delete-btn:hover {
    background: #ff5252;
  }

  .changes-indicator {
    padding: 10px 15px;
    background: #fff3cd;
    border-top: 1px solid #ffeaa7;
    border-radius: 0 0 8px 8px;
  }

  .changes-indicator p {
    margin: 0;
    color: #856404;
    font-size: 0.9em;
  }
</style>
