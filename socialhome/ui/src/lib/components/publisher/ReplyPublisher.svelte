<script lang="ts">
  let { route } = $props();

  // Extract the contentId from the named parameter using $derived
  const parentId = $derived(route?.result?.path?.params?.contentId);

  console.log('📝 ReplyPublisher loaded with route:', route);
  console.log('📝 ReplyPublisher parentId:', parentId);
</script>

<div style="background: green; color: white; padding: 20px; margin: 20px;">
  <h2>Reply Publisher Component</h2>
  <p>Parent ID: <strong>{parentId}</strong></p>
  <p>Route params: <strong>{JSON.stringify(route?.result?.path?.params)}</strong></p>
  <p>This is a placeholder ReplyPublisher component.</p>
</div>
