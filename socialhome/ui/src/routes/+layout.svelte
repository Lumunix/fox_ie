<script lang="ts">
  import '../app.css';
  let { children } = $props();
  import Navbar from '$lib/components/layout/Navbar.svelte';
</script>



<Navbar />

<main class="min-h-screen bg-gray-50 text-gray-900">
{@render children()}
</main>
