<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import {
    Heart,
    LayoutDashboard,
    Users,
    ClipboardList,
    Shield,
    LogOut,
    Menu,
    X,
    BarChart3
  } from 'lucide-svelte';
  import { browser } from '$app/environment';
  import Toast from '$lib/components/ui/Toast.svelte';
  import { onMount } from 'svelte';

  export let data;
  export let params = {};

  let mobileMenuOpen = false;

  $: if (browser && $auth.initialized && $auth.user && $auth.user.role !== 'admin') {
    if ($auth.user.role === 'patient') {
      goto('/dashboard/patient');
    } else {
      goto('/dashboard/pro');
    }
  }

  const navItems = [
    { href: '/dashboard/admin', label: 'Command Center', icon: LayoutDashboard },
    { href: '/dashboard/admin/missions', label: 'Missions', icon: ClipboardList },
    { href: '/dashboard/admin/professionnels', label: 'Professionnels', icon: Shield },
    { href: '/dashboard/admin/utilisateurs', label: 'Patients', icon: Users },
    { href: '/dashboard/admin/rapports', label: 'Rapports', icon: BarChart3 }
  ];

  async function handleSignOut() {
    await auth.signOut();
    goto('/');
  }
</script>

{#if $auth.user}
  <div class="min-h-screen bg-gray-50">
    <header class="bg-primary text-white md:hidden">
      <div class="flex items-center justify-between px-4 h-14">
        <div class="flex items-center gap-2">
          <Heart class="w-6 h-6" />
          <span class="font-bold">SoinDirect Admin</span>
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
      <div class="bg-primary text-white md:hidden px-4 py-4 space-y-2">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10
                   {$page.url.pathname === item.href ? 'bg-white/10' : ''}"
            on:click={() => mobileMenuOpen = false}
          >
            <svelte:component this={item.icon} class="w-5 h-5" />
            {item.label}
          </a>
        {/each}
        <button
          on:click={handleSignOut}
          class="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left hover:bg-white/10"
        >
          <LogOut class="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    {/if}

    <aside class="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-primary text-white">
      <div class="flex items-center justify-between px-6 h-16 border-b border-white/10">
        <div class="flex items-center gap-2">
          <Heart class="w-7 h-7" />
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
                     ? 'bg-white/10'
                     : 'hover:bg-white/10'}"
          >
            <svelte:component this={item.icon} class="w-5 h-5" />
            {item.label}
          </a>
        {/each}
      </nav>

      <div class="p-4 border-t border-white/10">
        <div class="flex items-center gap-3 mb-4 px-2">
          <div class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <span class="font-semibold">
              {$auth.user.nom?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <p class="font-medium">{$auth.user.nom}</p>
            <p class="text-sm text-white/60">Administrateur</p>
          </div>
        </div>
        <button
          on:click={handleSignOut}
          class="flex items-center gap-2 text-white/70 hover:text-white w-full px-2 py-2"
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
