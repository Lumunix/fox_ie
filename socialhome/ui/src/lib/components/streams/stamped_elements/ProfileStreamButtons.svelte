<script lang="ts">
  // Replace this with your actual Svelte store access
  const getProfile = () => ({
    uuid: 'some-uuid',
    stream_type: 'all_content', // or 'pinned'
    has_pinned_content: true,
  });

  const profile = getProfile();

  const pinnedContentVariant = profile.stream_type === "pinned" ? "btn-primary" : "btn-outline-dark";
  const profileContentVariant = profile.stream_type === "all_content" ? "btn-primary" : "btn-outline-dark";

  const gettext = (s: string) => s;

  const translations = {
    pinnedContent: gettext("Pinned content"),
    profileAllContent: gettext("All content"),
  };

  const urls = {
    pinnedContent: `/profile/${profile.uuid}/pinned`,
    profileAllContent: `/profile/${profile.uuid}/all`,
  };
</script>

<div>
  <div class="text-center profile-stream-buttons">
    {#if profile.has_pinned_content}
      <a class={`btn ${pinnedContentVariant}`} href={urls.pinnedContent}>
        {translations.pinnedContent}
      </a>
    {/if}
    <a class={`btn ${profileContentVariant}`} href={urls.profileAllContent}>
      {translations.profileAllContent}
    </a>
  </div>
</div>

<style>
  .profile-stream-buttons {
    margin-top: 8px;
    width: 100%;
  }

  .profile-stream-buttons .btn {
    width: 50%;
  }
</style>
