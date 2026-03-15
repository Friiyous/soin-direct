<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import {
    Heart,
    Home,
    PlusCircle,
    FileText,
    LogOut,
    Menu,
    X,
    Pill
  } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Toast from '$lib/components/ui/Toast.svelte';
  import { notifications } from '$lib/stores/notifications';
  import { theme } from '$lib/stores/theme';
  import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

  export let data;
  export let params = {};

  let mobileMenuOpen = false;

  $: if (browser && $auth.initialized && $auth.user && $auth.user.role !== 'patient') {
    if ($auth.user.role === 'admin') {
      goto('/dashboard/admin');
    } else {
      goto('/dashboard/pro');
    }
  }

  onMount(() => {
    if ($auth.user) {
      notifications.subscribeToMissions($auth.user.id, 'patient');
    }
  });

  const navItems = [
    { href: '/dashboard/patient', label: 'Accueil', icon: Home },
    { href: '/dashboard/patient/demander', label: 'Demander un soin', icon: PlusCircle },
    { href: '/dashboard/patient/medicaments', label: 'Médicaments', icon: Pill },
    { href: '/dashboard/patient/historique', label: 'Mon historique', icon: FileText }
  ];

  async function handleSignOut() {
    await auth.signOut();
    goto('/');
  }
</script>

{#if $auth.user}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header mobile -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 md:hidden">
      <div class="flex items-center justify-between px-4 h-14">
        <div class="flex items-center gap-2">
          <Heart class="w-6 h-6 text-primary" />
          <span class="font-bold dark:text-white">SoinDirect</span>
        </div>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button on:click={() => mobileMenuOpen = !mobileMenuOpen}>
            {#if mobileMenuOpen}
              <X class="w-6 h-6 dark:text-white" />
            {:else}
              <Menu class="w-6 h-6 dark:text-white" />
            {/if}
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile menu -->
    {#if mobileMenuOpen}
      <div class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 md:hidden px-4 py-4 space-y-2">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700
                   {$page.url.pathname === item.href ? 'bg-primary/5 text-primary' : 'dark:text-gray-200'}"
            on:click={() => mobileMenuOpen = false}
          >
            <svelte:component this={item.icon} class="w-5 h-5" />
            {item.label}
          </a>
        {/each}
        <button
          on:click={handleSignOut}
          class="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
        >
          <LogOut class="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    {/if}

    <!-- Sidebar desktop -->
    <aside class="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between px-6 h-16 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-2">
          <Heart class="w-7 h-7 text-primary" />
          <span class="font-bold text-lg dark:text-white">SoinDirect</span>
        </div>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <Toast />
        </div>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                   {$page.url.pathname === item.href
                     ? 'bg-primary text-white'
                     : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}"
          >
            <svelte:component this={item.icon} class="w-5 h-5" />
            {item.label}
          </a>
        {/each}
      </nav>

      <div class="p-4 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-3 mb-4 px-2">
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span class="text-primary font-semibold">
              {$auth.user.nom?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p class="font-medium dark:text-white">{$auth.user.nom}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Patient</p>
          </div>
        </div>
        <button
          on:click={handleSignOut}
          class="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 w-full px-2 py-2"
        >
          <LogOut class="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="md:pl-64">
      <div class="p-4 md:p-8">
        <slot />
      </div>
    </main>
  </div>
{/if}
