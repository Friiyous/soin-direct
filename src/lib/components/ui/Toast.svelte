<script lang="ts">
  import { notifications, type Notification } from '$lib/stores/notifications';
  import { fly } from 'svelte/transition';
  import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-svelte';

  $: unreadCount = $notifications.filter(n => !n.read).length;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };

  let showPanel = false;
</script>

<!-- Bell Button -->
<button 
  class="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
  on:click={() => showPanel = !showPanel}
>
  <Bell class="w-6 h-6 text-gray-600" />
  {#if unreadCount > 0}
    <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  {/if}
</button>

<!-- Notification Panel -->
{#if showPanel}
  <div 
    class="fixed inset-0 z-50"
    on:click={() => showPanel = false}
    on:keydown={(e) => e.key === 'Escape' && (showPanel = false)}
    role="button"
    tabindex="0"
  >
    <div 
      class="absolute right-4 top-20 w-80 max-h-96 bg-white rounded-2xl shadow-2xl overflow-hidden"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      transition:fly={{ y: -20, duration: 200 }}
    >
      <div class="p-4 border-b flex items-center justify-between bg-primary text-white">
        <div class="flex items-center gap-2">
          <Bell class="w-5 h-5" />
          <span class="font-bold">Notifications</span>
          {#if unreadCount > 0}
            <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>
          {/if}
        </div>
        {#if $notifications.length > 0}
          <button 
            class="text-xs hover:underline"
            on:click={() => notifications.markAllAsRead()}
          >
            Tout marquer lu
          </button>
        {/if}
      </div>

      <div class="max-h-80 overflow-y-auto">
        {#if $notifications.length === 0}
          <div class="p-8 text-center text-gray-500">
            <Bell class="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Aucune notification</p>
          </div>
        {:else}
          {#each $notifications as notification}
            <div 
              class="p-4 border-b hover:bg-gray-50 transition-colors {!notification.read ? 'bg-blue-50' : ''}"
            >
              <div class="flex gap-3">
                <div class="w-10 h-10 {colors[notification.type]} rounded-full flex items-center justify-center flex-shrink-0">
                  <svelte:component this={icons[notification.type]} class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm">{notification.title}</p>
                  <p class="text-xs text-gray-500 mt-1">{notification.message}</p>
                  <p class="text-xs text-gray-400 mt-1">
                    {new Date(notification.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button 
                  class="text-gray-400 hover:text-gray-600"
                  on:click={() => notifications.remove(notification.id)}
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Toast Notifications (Bottom Right) -->
<div class="fixed bottom-4 right-4 z-50 space-y-2">
  {#each $notifications.slice(0, 3) as notification (notification.id)}
    <div 
      class="flex items-center gap-3 p-4 bg-white rounded-xl shadow-lg border-l-4 {colors[notification.type]}"
      transition:fly={{ x: 100, duration: 300 }}
    >
      <svelte:component this={icons[notification.type]} class="w-5 h-5 {colors[notification.type].replace('bg-', 'text-')}" />
      <div class="flex-1">
        <p class="font-semibold text-sm">{notification.title}</p>
        <p class="text-xs text-gray-500">{notification.message}</p>
      </div>
      <button 
        class="text-gray-400 hover:text-gray-600"
        on:click={() => notifications.remove(notification.id)}
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  {/each}
</div>
