<script lang="ts">
  // Mock data for following list
  const following = [
    {
      id: 1,
      username: "john_doe",
      displayName: "John Doe",
      avatar: "https://via.placeholder.com/50",
      bio: "Full-stack developer passionate about web technologies",
      followers: 1234,
      isFollowing: true
    },
    {
      id: 2,
      username: "jane_smith",
      displayName: "Jane Smith",
      avatar: "https://via.placeholder.com/50",
      bio: "UI/UX Designer creating beautiful digital experiences",
      followers: 856,
      isFollowing: true
    },
    {
      id: 3,
      username: "tech_guru",
      displayName: "Tech Guru",
      avatar: "https://via.placeholder.com/50",
      bio: "Software architect and technology enthusiast",
      followers: 3421,
      isFollowing: true
    }
  ];

  function handleUnfollow(userId: number) {
    console.log(`Unfollowing user ${userId}`);
    // In real app, this would make an API call
  }
</script>

<div class="following-container">
  <h2>Following ({following.length})</h2>

  <div class="users-list">
    {#each following as user}
      <div class="user-card">
        <img src={user.avatar} alt={user.displayName} class="avatar" />
        <div class="user-info">
          <h3 class="display-name">{user.displayName}</h3>
          <p class="username">@{user.username}</p>
          <p class="bio">{user.bio}</p>
          <p class="followers">{user.followers} followers</p>
        </div>
        <div class="actions">
          <button
            class="unfollow-btn"
            on:click={() => handleUnfollow(user.id)}
          >
            Following
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .following-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  h2 {
    color: #333;
    border-bottom: 2px solid #e1e8ed;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  .user-card {
    display: flex;
    gap: 15px;
    padding: 15px;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    margin-bottom: 15px;
    background: white;
  }

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .user-info {
    flex-grow: 1;
  }

  .display-name {
    margin: 0 0 5px 0;
    color: #333;
    font-size: 1.1em;
  }

  .username {
    margin: 0 0 8px 0;
    color: #1da1f2;
    font-size: 0.9em;
  }

  .bio {
    margin: 0 0 8px 0;
    color: #657786;
    font-size: 0.9em;
  }

  .followers {
    margin: 0;
    color: #657786;
    font-size: 0.8em;
  }

  .unfollow-btn {
    background: #1da1f2;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
  }

  .unfollow-btn:hover {
    background: #1991da;
  }
</style>
