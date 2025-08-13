<script lang="ts">
  import { onMount } from 'svelte';
  // Import your stores here
  // import { userStore } from './stores/userStore';
  // import { contentStore } from './stores/contentStore';

  onMount(() => {
    // Initialize your app and load data from APIs
    console.log('Svelte app mounted!');
    // loadInitialData();
  });

  // async function loadInitialData() {
  //   // Load user data, content, etc. from your Django APIs
  //   await userStore.fetchCurrentUser();
  //   await contentStore.loadContent();
  // }
  import Counter from './lib/Counter.svelte'
</script>

<main class="min-h-screen bg-surface-50 dark:bg-surface-900">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-8">Svelte App</h1>
    <!-- Your components will go here -->
      <div class="card">
        <Counter />
      </div>
      <div class="w-full grid grid-cols-3 gap-4">
  <div class="card p-4 preset-filled-primary-500">Card</div>
  <div class="card p-4 preset-tonal-primary">Card</div>
  <div class="card p-4 preset-outlined-primary-500">Card</div>

  <div class="card p-4 preset-filled-secondary-500">Card</div>
  <div class="card p-4 preset-tonal-secondary">Card</div>
  <div class="card p-4 preset-outlined-secondary-500">Card</div>

  <div class="card p-4 preset-filled-tertiary-500">Card</div>
  <div class="card p-4 preset-tonal-tertiary">Card</div>
  <div class="card p-4 preset-outlined-tertiary-500">Card</div>

  <div class="card p-4 preset-filled-success-500">Card</div>
  <div class="card p-4 preset-tonal-success">Card</div>
  <div class="card p-4 preset-outlined-success-500">Card</div>

  <div class="card p-4 preset-filled-warning-500">Card</div>
  <div class="card p-4 preset-tonal-warning">Card</div>
  <div class="card p-4 preset-outlined-warning-500">Card</div>

  <div class="card p-4 preset-filled-error-500">Card</div>
  <div class="card p-4 preset-tonal-error">Card</div>
  <div class="card p-4 preset-outlined-error-500">Card</div>

  <div class="card p-4 preset-filled-surface-500">Card</div>
  <div class="card p-4 preset-tonal-surface">Card</div>
  <div class="card p-4 preset-outlined-surface-500">Card</div>
</div>
  </div>
</main>
