<script lang="ts">
  import BaseStampedElement from './BaseStampedElement.svelte';

  // Replace gettext with your i18n solution or a stub if you don’t have one yet
  const gettext = (str: string) => str;

  const title = gettext("Followed");
  const helpText = gettext("Content from followed users.");
</script>

<BaseStampedElement {title} {helpText} />
