<script lang="ts">
  import { Sun, Moon } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme';
</script>

<button
  on:click={() => theme.toggle()}
  class="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  aria-label="Changer de thème"
>
  <div class="relative w-5 h-5">
    <div 
      class="absolute inset-0 transition-transform duration-300"
      class:rotate-0={$theme === 'light'}
      class:rotate-90={$theme === 'dark'}
      class:opacity-100={$theme === 'light'}
      class:opacity-0={$theme === 'dark'}
    >
      <Sun class="w-5 h-5 text-yellow-500" />
    </div>
    <div 
      class="absolute inset-0 transition-transform duration-300"
      class:-rotate-90={$theme === 'light'}
      class:rotate-0={$theme === 'dark'}
      class:opacity-0={$theme === 'light'}
      class:opacity-100={$theme === 'dark'}
    >
      <Moon class="w-5 h-5 text-blue-400" />
    </div>
  </div>
</button>
