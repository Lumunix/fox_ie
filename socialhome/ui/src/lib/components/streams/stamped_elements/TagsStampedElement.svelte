<script lang="ts">
  // Replace with your actual i18n solution if needed
  const gettext = (str: string) => str;

  const title = gettext("Followed tags");
  const helpText = gettext("Content from all followed tags.");
</script>

<div>
  <h2>{title}</h2>
  <p>{helpText}</p>
</div>
