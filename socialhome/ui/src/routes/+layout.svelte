<script lang="ts">
  import '../app.css';
  let { children } = $props();
  import Navbar from '$lib/components/layout/Navbar.svelte';
</script>



<Navbar />

<main class="min-h-screen">
{@render children()}
</main>
