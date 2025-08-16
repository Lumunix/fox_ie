<script lang="ts">
  // Props that can be passed from routes
  export let user: string | undefined = undefined;
  export let uuid: string | undefined = undefined;
  export let tag: string | undefined = undefined;
  export let contentId: string | undefined = undefined;
  export let shorttext: string | undefined = undefined;

  // Mock data for testing
  const mockPosts = [
    {
      id: 1,
      author: "john_doe",
      content: "Just had an amazing day exploring the city! 🌟",
      timestamp: "2 hours ago",
      likes: 42,
      reposts: 7,
      replies: 12
    },
    {
      id: 2,
      author: "jane_smith",
      content: "Working on a new project with #svelte and loving it! The reactivity system is incredible.",
      timestamp: "4 hours ago",
      likes: 28,
      reposts: 5,
      replies: 8
    },
    {
      id: 3,
      author: "tech_guru",
      content: "Hot take: TypeScript makes JavaScript development so much better. Change my mind! 🤔",
      timestamp: "6 hours ago",
      likes: 156,
      reposts: 23,
      replies: 45
    }
  ];

  // Filter posts based on props
  let filteredPosts = mockPosts;

  $: {
    if (user) {
      filteredPosts = mockPosts.filter(post => post.author === user);
    } else if (tag) {
      filteredPosts = mockPosts.filter(post => post.content.includes(`#${tag}`));
    } else if (contentId) {
      filteredPosts = mockPosts.filter(post => post.id.toString() === contentId);
    } else {
      filteredPosts = mockPosts;
    }
  }

  let streamType = "Public Timeline";
  $: {
    if (user) streamType = `@${user}'s Posts`;
    else if (uuid) streamType = "Profile Posts";
    else if (tag) streamType = `#${tag} Posts`;
    else if (contentId) streamType = "Single Post";
  }
</script>

<div class="stream-container">
  <h2 class="stream-title">{streamType}</h2>

  {#if user}
    <p class="stream-info">Viewing posts from user: <strong>{user}</strong></p>
  {/if}

  {#if tag}
    <p class="stream-info">Posts tagged with: <strong>#{tag}</strong></p>
  {/if}

  {#if uuid}
    <p class="stream-info">Profile UUID: <strong>{uuid}</strong></p>
  {/if}

  <div class="posts">
    {#each filteredPosts as post}
      <div class="post">
        <div class="post-header">
          <strong class="author">@{post.author}</strong>
          <span class="timestamp">{post.timestamp}</span>
        </div>
        <p class="post-content">{post.content}</p>
        <div class="post-actions">
          <button class="action-btn">👍 {post.likes}</button>
          <button class="action-btn">🔄 {post.reposts}</button>
          <button class="action-btn">💬 {post.replies}</button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .stream-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  .stream-title {
    color: #333;
    border-bottom: 2px solid #e1e8ed;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  .stream-info {
    background: #f7f9fa;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 20px;
    color: #657786;
  }

  .post {
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    background: white;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .author {
    color: #1da1f2;
  }

  .timestamp {
    color: #657786;
    font-size: 0.9em;
  }

  .post-content {
    margin-bottom: 15px;
    line-height: 1.4;
  }

  .post-actions {
    display: flex;
    gap: 15px;
  }

  .action-btn {
    background: none;
    border: none;
    color: #657786;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
  }

  .action-btn:hover {
    background: #f7f9fa;
  }
</style>
