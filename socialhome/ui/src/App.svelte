<script lang="ts">
  import { Router } from '@mateothegreat/svelte5-router';
  import { routes } from './routes';

  console.log('🚀 App.svelte is loading!');
  console.log('🌐 Current location:', window.location.href);
  console.log('📍 Routes available:', routes);

  // Log navigation changes
  function handleLocationChange() {
    console.log('🌐 Location changed:', {
      href: window.location.href,
      pathname: window.location.pathname,
      hash: window.location.hash,
      search: window.location.search
    });
  }

  // Listen for navigation
  window.addEventListener('popstate', handleLocationChange);

  // Log initial load
  console.log('🚀 App loaded at:', window.location.href);
</script>
<Router {routes} />
