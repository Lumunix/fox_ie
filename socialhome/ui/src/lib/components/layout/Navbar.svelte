<script lang="ts">
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';

  const currentPath = derived(page, $page => $page.url.pathname);
</script>

<nav class="bg-white shadow-sm px-6 py-3 mb-6 border-b">
  <div class="max-w-5xl mx-auto flex justify-between items-center">
    <div class="font-bold text-lg text-blue-600">
      🐦 StreamApp
    </div>
    <div class="space-x-4">
      <a href="/" class="hover:underline text-sm" class:font-semibold={currentPath === '/'}>Home</a>
      <a href="/compose" class="hover:underline text-sm" class:font-semibold={currentPath === '/compose'}>Compose</a>
      <a href="/profile/local-user-id" class="hover:underline text-sm">Profile</a>
    </div>
  </div>
</nav>
