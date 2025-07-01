<script lang="ts">
  import { onMount } from 'svelte';

  // Replace with your actual store integration
  const getStore = () => ({
    user: { followed_tags: ['exampletag'] },
    stream: { tag: { name: 'exampletag', uuid: '123-uuid' } },
    application: { isUserAuthenticated: true },
  });

  const store = getStore();

  const name = store.stream.tag.name;
  const followingTag = store.user.followed_tags.includes(name);
  const showTagActions = store.application.isUserAuthenticated;

  const gettext = (s: string) => s;

  const translations = {
    follow: gettext("Follow"),
    unfollow: gettext("Unfollow"),
  };

  const title = `#${name}`;
  const helpText = `${gettext("All content tagged with")} #${name}.`;

  function onFollowClick() {
    console.log("Follow tag", store.stream.tag.uuid);
    // Replace with actual store dispatch if using Svelte store
  }

  function onUnFollowClick() {
    console.log("Unfollow tag", store.stream.tag.uuid);
    // Replace with actual store dispatch if using Svelte store
  }
</script>

<div>
  {#if showTagActions}
    <div class="pull-right">
      {#if !followingTag}
        <button
          class="btn btn-outline-dark tag-actions-button"
          title={translations.follow}
          aria-label={translations.follow}
          on:click|preventDefault={onFollowClick}
        >
          <i class="fa fa-plus"></i>
        </button>
      {:else}
        <button
          class="btn btn-outline-dark tag-actions-button"
          title={translations.unfollow}
          aria-label={translations.unfollow}
          on:click|preventDefault={onUnFollowClick}
        >
          <i class="fa fa-minus"></i>
        </button>
      {/if}
    </div>
  {/if}

  <h2>{title}</h2>
  <p>{helpText}</p>
</div>

<style>
  .tag-actions-button {
    cursor: pointer;
  }
</style>
