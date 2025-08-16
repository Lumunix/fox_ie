<script lang="ts">
  // Props that can be passed from routes
  export let shareUrl: string | undefined = undefined;
  export let shareTitle: string | undefined = undefined;
  export let shareNotes: string | undefined = undefined;

  let content = '';
  let visibility = 'public';
  let isPosting = false;
  let characterCount = 0;
  let maxCharacters = 280;
  let isOverLimit = false;

  // Initialize with share data if provided
  $: if (shareUrl || shareTitle || shareNotes) {
    content = `${shareTitle ? shareTitle + '\n' : ''}${shareNotes ? shareNotes + '\n' : ''}${shareUrl || ''}`;
  }

  $: characterCount = content.length;
  $: isOverLimit = characterCount > maxCharacters;

  async function handlePost() {
    if (isOverLimit || !content.trim()) return;

    isPosting = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Publishing post:', {
      content,
      visibility,
      shareUrl,
      shareTitle,
      shareNotes
    });

    // Reset form
    content = '';
    isPosting = false;

    alert('Post published successfully!');
  }
</script>

<div class="publisher-container">
  <h2>Create New Post</h2>

  {#if shareUrl || shareTitle}
    <div class="share-info">
      <h3>Sharing Content</h3>
      {#if shareTitle}
        <p><strong>Title:</strong> {shareTitle}</p>
      {/if}
      {#if shareUrl}
        <p><strong>URL:</strong> {shareUrl}</p>
      {/if}
      {#if shareNotes}
        <p><strong>Notes:</strong> {shareNotes}</p>
      {/if}
    </div>
  {/if}

  <div class="publisher-form">
    <textarea
      bind:value={content}
      placeholder="What's on your mind?"
      rows="5"
      class:over-limit={isOverLimit}
    ></textarea>

    <div class="form-footer">
      <div class="left-controls">
        <select bind:value={visibility}>
          <option value="public">🌐 Public</option>
          <option value="followers">👥 Followers Only</option>
          <option value="private">🔒 Private</option>
        </select>
      </div>

      <div class="right-controls">
        <span class="character-count" class:over-limit={isOverLimit}>
          {characterCount}/{maxCharacters}
        </span>
        <button
          class="post-btn"
          disabled={isPosting || isOverLimit || !content.trim()}
          on:click={handlePost}
        >
          {isPosting ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .publisher-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  h2 {
    color: #333;
    margin-bottom: 20px;
  }

  .share-info {
    background: #f0f8ff;
    border: 1px solid #b3d9ff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .share-info h3 {
    margin: 0 0 10px 0;
    color: #1da1f2;
  }

  .share-info p {
    margin: 5px 0;
    color: #333;
    font-size: 0.9em;
  }

  .publisher-form {
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    background: white;
  }

  textarea {
    width: 100%;
    border: none;
    padding: 15px;
    font-size: 1em;
    resize: vertical;
    min-height: 120px;
    border-radius: 8px 8px 0 0;
  }

  textarea:focus {
    outline: none;
    box-shadow: 0 0 0 2px #1da1f2;
  }

  textarea.over-limit {
    border-color: #ff6b6b;
    background: #fff5f5;
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-top: 1px solid #e1e8ed;
  }

  select {
    padding: 8px 12px;
    border: 1px solid #e1e8ed;
    border-radius: 4px;
    background: white;
  }

  .right-controls {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .character-count {
    color: #657786;
    font-size: 0.9em;
  }

  .character-count.over-limit {
    color: #ff6b6b;
    font-weight: bold;
  }

  .post-btn {
    background: #1da1f2;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
  }

  .post-btn:hover:not(:disabled) {
    background: #1991da;
  }

  .post-btn:disabled {
    background: #aab8c2;
    cursor: not-allowed;
  }
</style>
