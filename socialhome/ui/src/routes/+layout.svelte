<script lang="ts">
  import Navbar from '$lib/components/layout/Navbar.svelte';
</script>

<Navbar />

<main class="min-h-screen bg-gray-50 text-gray-900">
  <slot />
</main>
