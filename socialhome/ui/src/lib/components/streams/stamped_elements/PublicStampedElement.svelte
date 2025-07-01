<script lang="ts">
  import BaseStampedElement from './BaseStampedElement.svelte';

  // Replace with your real i18n solution if needed
  const gettext = (str: string) => str;

  const title = gettext("Public");
  const helpText = gettext("Contains public content from around the network.");
</script>

<BaseStampedElement {title} {helpText} />
