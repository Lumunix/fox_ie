<script lang="ts">
  export let parentId: string | undefined = undefined;

  let replyContent = '';
  let isReplying = false;
  let characterCount = 0;
  let maxCharacters = 280;
  let isOverLimit = false;

  // Mock parent post data
  const parentPost = {
    id: parentId || "123",
    author: "original_poster",
    content: "This is the original post that we're replying to. It contains some interesting thoughts about web development!",
    timestamp: "2 hours ago"
  };

  $: characterCount = replyContent.length;
  $: isOverLimit = characterCount > maxCharacters;

  async function handleReply() {
    if (isOverLimit || !replyContent.trim()) return;

    isReplying = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Publishing reply:', {
      content: replyContent,
      parentId: parentPost.id
    });

    // Reset form
    replyContent = '';
    isReplying = false;

    alert('Reply posted successfully!');
  }
</script>

<div class="reply-publisher-container">
  <h2>Reply to Post</h2>

  <div class="parent-post">
    <div class="post-header">
      <strong>@{parentPost.author}</strong>
      <span class="timestamp">{parentPost.timestamp}</span>
    </div>
    <p class="post-content">{parentPost.content}</p>
  </div>

  <div class="reply-form">
    <div class="reply-indicator">
      Replying to <strong>@{parentPost.author}</strong>
    </div>

    <textarea
      bind:value={replyContent}
      placeholder="Write your reply..."
      rows="4"
      class:over-limit={isOverLimit}
    ></textarea>

    <div class="form-footer">
      <div class="character-count" class:over-limit={isOverLimit}>
        {characterCount}/{maxCharacters}
      </div>

      <button
        class="reply-btn"
        disabled={isReplying || isOverLimit || !replyContent.trim()}
        on:click={handleReply}
      >
        {isReplying ? 'Replying...' : 'Reply'}
      </button>
    </div>
  </div>
</div>

<style>
  .reply-publisher-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  h2 {
    color: #333;
    margin-bottom: 20px;
  }

  .parent-post {
    background: #f7f9fa;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .post-header strong {
    color: #1da1f2;
  }

  .timestamp {
    color: #657786;
    font-size: 0.9em;
  }

  .post-content {
    margin: 0;
    line-height: 1.4;
    color: #333;
  }

  .reply-form {
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    background: white;
  }

  .reply-indicator {
    padding: 15px 15px 0 15px;
    color: #657786;
    font-size: 0.9em;
  }

  textarea {
    width: 100%;
    border: none;
    padding: 15px;
    font-size: 1em;
    resize: vertical;
    min-height: 100px;
  }

  textarea:focus {
    outline: none;
    box-shadow: 0 0 0 2px #1da1f2;
  }

  textarea.over-limit {
    background: #fff5f5;
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-top: 1px solid #e1e8ed;
  }

  .character-count {
    color: #657786;
    font-size: 0.9em;
  }

  .character-count.over-limit {
    color: #ff6b6b;
    font-weight: bold;
  }

  .reply-btn {
    background: #1da1f2;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
  }

  .reply-btn:hover:not(:disabled) {
    background: #1991da;
  }

  .reply-btn:disabled {
    background: #aab8c2;
    cursor: not-allowed;
  }
</style>
