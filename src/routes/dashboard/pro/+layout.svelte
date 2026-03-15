<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import {
    Heart,
    Home,
    ClipboardList,
    LogOut,
    Menu,
    X,
    Stethoscope
  } from 'lucide-svelte';
  import { browser } from '$app/environment';
  import Toast from '$lib/components/ui/Toast.svelte';
  import { onMount } from 'svelte';
  import { notifications } from '$lib/stores/notifications';

  export let data;
  export let params = {};

  let mobileMenuOpen = false;

  $: if (browser && $auth.initialized && $auth.user && $auth.user.role === 'patient') {
    goto('/dashboard/patient');
  } else if (browser && $auth.initialized && $auth.user && $auth.user.role === 'admin') {
    goto('/dashboard/admin');
  }

  // Subscribe to real-time notifications
  onMount(() => {
    if ($auth.user) {
      notifications.subscribeToMissions($auth.user.id, 'pro');
    }
  });

  const navItems = [
    { href: '/dashboard/pro', label: 'Missions', icon: ClipboardList },
    { href: '/dashboard/pro/suivi', label: 'Mes interventions', icon: Stethoscope }
  ];

  const roleLabels: Record<string, string> = {
    ide: 'Infirmier',
    biologist: 'Biographe',
    kine: 'Kinésithérapeute'
  };

  async function handleSignOut() {
    await auth.signOut();
    goto('/');
  }
</script>

{#if $auth.user}
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b md:hidden">
      <div class="flex items-center justify-between px-4 h-14">
        <div class="flex items-center gap-2">
          <Heart class="w-6 h-6 text-primary" />
          <span class="font-bold">SoinDirect</span>
        </div>
        <button on:click={() => mobileMenuOpen = !mobileMenuOpen}>
          {#if mobileMenuOpen}
            <X class="w-6 h-6" />
          {:else}
            <Menu class="w-6 h-6" />
          {/if}
        </button>
      </div>
    </header>

    {#if mobileMenuOpen}
      <div class="bg-white border-b md:hidden px-4 py-4 space-y-2">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50
                   {$page.url.pathname === item.href ? 'bg-primary/5 text-primary' : ''}"
            on:click={() => mobileMenuOpen = false}
          >
            <svelte:component this={item.icon} class="w-5 h-5" />
            {item.label}
          </a>
        {/each}
        <button
          on:click={handleSignOut}
          class="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-red-600 hover:bg-red-50"
        >
          <LogOut class="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    {/if}

    <aside class="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-white border-r">
      <div class="flex items-center justify-between px-6 h-16 border-b">
        <div class="flex items-center gap-2">
          <Heart class="w-7 h-7 text-primary" />
          <span class="font-bold text-lg">SoinDirect</span>
        </div>
        <Toast />
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                   {$page.url.pathname === item.href
                     ? 'bg-primary text-white'
                     : 'text-gray-600 hover:bg-gray-50'}"
          >
            <svelte:component this={item.icon} class="w-5 h-5" />
            {item.label}
          </a>
        {/each}
      </nav>

      <div class="p-4 border-t">
        <div class="flex items-center gap-3 mb-4 px-2">
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span class="text-primary font-semibold">
              {$auth.user.nom?.charAt(0) || 'P'}
            </span>
          </div>
          <div>
            <p class="font-medium">{$auth.user.nom}</p>
            <p class="text-sm text-gray-500">{roleLabels[$auth.user.role] || 'Professionnel'}</p>
          </div>
        </div>
        <button
          on:click={handleSignOut}
          class="flex items-center gap-2 text-gray-600 hover:text-red-600 w-full px-2 py-2"
        >
          <LogOut class="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>

    <main class="md:pl-64">
      <div class="p-4 md:p-8">
        <slot />
      </div>
    </main>
  </div>
{/if}
