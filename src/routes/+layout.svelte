<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import { theme } from '$lib/stores/theme';
  
  export let data;
  export let params = {};

  onMount(() => {
    // Initialize theme
    theme.init();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  });
</script>

<slot />
