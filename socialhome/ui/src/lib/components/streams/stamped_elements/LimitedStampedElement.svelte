<script lang="ts">
  import BaseStampedElement from './BaseStampedElement.svelte';

  // Replace this with your actual i18n library or function if needed
  const gettext = (str: string) => str;

  const title = gettext("Limited");
  const helpText = gettext("Contains non-public content where you are recipient.");
</script>

<BaseStampedElement {title} {helpText} />
