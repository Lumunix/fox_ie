<!--<script lang="ts">-->
<!--  import { onMount } from 'svelte';-->
<!--  import { streamStore } from '$lib/stores/stream';-->
<!--  ///import { profilesStore } from '$lib/stores/profiles';-->

<!--  export let profileUuid: string;-->
<!--  export let showProfileLink: boolean = true;-->

<!--  $: profile = profilesStore.all[profileUuid] ?? null;-->
<!--  $: currentProfileId = streamStore.currentBrowsingProfileId;-->
<!--  $: isAuthenticated = streamStore.isAuthenticated;-->

<!--  $: showFollowBtn = isAuthenticated && profile && !profile.user_following && profile.id !== currentProfileId;-->
<!--  $: showUnfollowBtn = isAuthenticated && profile && profile.user_following && profile.id !== currentProfileId;-->

<!--  onMount(() => {-->
<!--    if (!profilesStore.all[profileUuid]) {-->
<!--      profilesStore.fetchProfile(profileUuid);-->
<!--    }-->
<!--  });-->

<!--  const follow = () => profilesStore.follow(profile.uuid);-->
<!--  const unfollow = () => profilesStore.unfollow(profile.uuid);-->
<!--</script>-->

<!--{#if profile}-->
<!--  <div class="flex gap-2 flex-wrap items-center">-->
<!--    {#if showProfileLink}-->
<!--      <a-->
<!--        href={profile.url}-->
<!--        class="px-2 py-1 text-sm border rounded hover:bg-gray-100"-->
<!--        title="Profile"-->
<!--        aria-label="Profile"-->
<!--      >-->
<!--        <i class="fa fa-user"></i>-->
<!--      </a>-->
<!--    {/if}-->

<!--    {#if !profile.is_local}-->
<!--      <a-->
<!--        href={profile.home_url}-->
<!--        target="_blank"-->
<!--        rel="nofollow"-->
<!--        class="px-2 py-1 text-sm border rounded hover:bg-gray-100"-->
<!--        title="Home"-->
<!--        aria-label="Home"-->
<!--      >-->
<!--        <i class="fa fa-home"></i>-->
<!--      </a>-->
<!--    {/if}-->

<!--    {#if showUnfollowBtn}-->
<!--      <button-->
<!--        class="px-2 py-1 text-sm border rounded hover:bg-gray-100"-->
<!--        on:click|preventDefault={unfollow}-->
<!--        title="Unfollow"-->
<!--        aria-label="Unfollow"-->
<!--      >-->
<!--        <i class="fa fa-minus"></i>-->
<!--      </button>-->
<!--    {/if}-->

<!--    {#if showFollowBtn}-->
<!--      <button-->
<!--        class="px-2 py-1 text-sm border rounded hover:bg-gray-100"-->
<!--        on:click|preventDefault={follow}-->
<!--        title="Follow"-->
<!--        aria-label="Follow"-->
<!--      >-->
<!--        <i class="fa fa-plus"></i>-->
<!--      </button>-->
<!--    {/if}-->
<!--  </div>-->
<!--{/if}-->
