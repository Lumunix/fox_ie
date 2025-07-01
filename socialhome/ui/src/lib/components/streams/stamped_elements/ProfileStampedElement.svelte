<script lang="ts">
  import { onMount } from 'svelte';
  import ProfileReactionButtons from './ProfileReactionButtons.svelte';

  // Replace with your Svelte store implementation
  const getProfile = () => ({
    uuid: 'some-uuid',
    id: 1,
    name: 'John Doe',
    handle: 'johndoe@example.com',
    fid: 'FID12345',
    following_count: 12,
    followers_count: 34,
    image_url_large: '/static/images/example.png',
    has_pinned_content: true,
    is_local: false,
  });

  const profile = getProfile();

  const displayName = profile.name || profile.fid;
  const profileHandle = profile.handle || profile.fid;
  const icon = "/static/images/pony300.png";

  // Replace with your auth check
  const isUserAuthenticated = true;
  const currentBrowsingProfileId = 2; // stubbed

  const showProfileButtons = isUserAuthenticated && profile.id === currentBrowsingProfileId;
  const showProfileReactionButtons = isUserAuthenticated && profile.id !== currentBrowsingProfileId;

  const gettext = (s: string) => s;

  const translations = {
    changePicture: gettext("Change picture"),
    followers: gettext("Followers"),
    following: gettext("Following"),
    organizeProfileContent: gettext("Organize profile content"),
    updateProfile: gettext("Update profile"),
    userHandle: gettext("User handle or URL on The Federation"),
  };

  const urls = {
    contactsFollowing: "/contacts/following",
    contactsFollowers: "/contacts/followers",
    organizeProfileUrl: "/profile/organize",
    pictureUpdate: "/profile/picture-update",
    updateProfile: "/profile/update",
  };

  function requestProfileUpdate(event: Event, profileObj: any, iconUrl: string) {
    const target = event.target as HTMLImageElement;
    target.src = iconUrl;
  }
</script>

<div>
  {#if showProfileReactionButtons}
    <div class="pull-right">
      <ProfileReactionButtons profileUuid={profile.uuid} showProfileLink={false} />
    </div>
  {/if}
  <div class="clearfix"></div>

  {#if showProfileButtons}
    <div class="pull-right text-right">
      <div class="dropdown">
        <button class="btn btn-outline-dark dropdown-toggle" type="button">
          <i id="profile-menu-button" class="fa fa-cog"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-right">
          <a
            class="dropdown-item"
            href={urls.pictureUpdate}
            title={translations.changePicture}
            aria-label={translations.changePicture}
          >
            {translations.changePicture}
          </a>
          {#if profile.has_pinned_content}
            <a
              class="dropdown-item"
              href={urls.organizeProfileUrl}
              title={translations.organizeProfileContent}
              aria-label={translations.organizeProfileContent}
            >
              {translations.organizeProfileContent}
            </a>
          {/if}
          <a
            class="dropdown-item"
            href={urls.updateProfile}
            title={translations.updateProfile}
            aria-label={translations.updateProfile}
          >
            {translations.updateProfile}
          </a>
        </div>
      </div>

      <div class="mt-1">
        <a
          class="btn btn-outline-dark"
          href={urls.contactsFollowing}
          title={translations.following}
          aria-label={translations.following}
        >
          <i class="fa fa-user"></i>
          <i class="fa fa-arrow-right"></i>
          <i class="fa fa-users"></i>
          {profile.following_count}
        </a>
      </div>

      <div class="mt-1">
        <a
          class="btn btn-outline-dark"
          href={urls.contactsFollowers}
          title={translations.followers}
          aria-label={translations.followers}
        >
          <i class="fa fa-users"></i>
          <i class="fa fa-arrow-right"></i>
          <i class="fa fa-user"></i>
          {profile.followers_count}
        </a>
      </div>
    </div>

  {:else if profile.is_local}
    <div class="pull-right">
      <div class="mt-1">
        <span title={translations.following} aria-label={translations.following}>
          <i class="fa fa-user"></i>
          <i class="fa fa-arrow-right"></i>
          <i class="fa fa-users"></i>
          {profile.following_count}
        </span>
      </div>
      <div class="mt-1">
        <span title={translations.followers} aria-label={translations.followers}>
          <i class="fa fa-users"></i>
          <i class="fa fa-arrow-right"></i>
          <i class="fa fa-user"></i>
          {profile.followers_count}
        </span>
      </div>
    </div>
  {/if}

  <div class="d-inline-block">
    <img
      class="profile-stream-stamped-image"
      src={profile.image_url_large}
      on:error={(e) => requestProfileUpdate(e, profile, icon)}
    />
  </div>

  <div class="d-inline-block align-center stamped-profile-info">
    <h1>{@html displayName}</h1>
    <h3>
      <cite title={translations.userHandle}>{profileHandle}</cite>
    </h3>
  </div>

  <div class="clearfix"></div>
</div>

<style>
  .dropdown-menu-right {
    right: auto;
  }
</style>
