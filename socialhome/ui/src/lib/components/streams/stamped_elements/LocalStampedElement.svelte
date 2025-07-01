<script lang="ts">
  import BaseStampedElement from './BaseStampedElement.svelte';

  // Replace this with your actual i18n solution if needed
  const gettext = (str: string) => str;

  const title = gettext("Local");
  const helpText = gettext("Contains content from local users.");
</script>

<BaseStampedElement {title} {helpText} />
