<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { chat, type Message } from '$lib/stores/chat';
  import { auth } from '$lib/stores/auth';
  import { Send, X, MessageCircle, User } from 'lucide-svelte';
  import { fly, fade } from 'svelte/transition';

  export let missionId: string;
  export let receiverId: string;
  export let receiverName: string = 'Professionnel';
  export let onClose: () => void = () => {};

  let newMessage = '';
  let messagesContainer: HTMLElement;
  let sending = false;

  $: messages = $chat;
  $: currentUserId = $auth.user?.id;

  onMount(async () => {
    await chat.loadMessages(missionId);
    await chat.markAsRead(missionId);
    scrollToBottom();
  });

  onDestroy(() => {
    chat.cleanup();
  });

  function scrollToBottom() {
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 100);
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || sending) return;

    sending = true;
    const result = await chat.sendMessage(missionId, receiverId, newMessage.trim());
    
    if (result) {
      newMessage = '';
      scrollToBottom();
    }
    sending = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function isOwnMessage(senderId: string): boolean {
    return senderId === currentUserId;
  }
</script>

<div 
  class="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border"
  transition:fly={{ y: 20, duration: 300 }}
>
  <!-- Header -->
  <div class="bg-primary text-white p-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
        <MessageCircle class="w-5 h-5" />
      </div>
      <div>
        <p class="font-semibold">{receiverName}</p>
        <p class="text-xs text-white/70">Discussion en cours</p>
      </div>
    </div>
    <button 
      on:click={onClose}
      class="p-2 hover:bg-white/10 rounded-xl transition-colors"
    >
      <X class="w-5 h-5" />
    </button>
  </div>

  <!-- Messages -->
  <div 
    bind:this={messagesContainer}
    class="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50"
  >
    {#if messages.length === 0}
      <div class="text-center text-gray-400 py-8" in:fade>
        <MessageCircle class="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p class="text-sm">Aucun message</p>
        <p class="text-xs">Commencez la conversation !</p>
      </div>
    {:else}
      {#each messages as message (message.id)}
        <div 
          class="flex {isOwnMessage(message.sender_id) ? 'justify-end' : 'justify-start'}"
          in:fly={{ y: 10, duration: 200 }}
        >
          <div 
            class="max-w-[75%] {isOwnMessage(message.sender_id) 
              ? 'bg-primary text-white rounded-2xl rounded-br-md' 
              : 'bg-white border rounded-2xl rounded-bl-md'}"
          >
            <div class="p-3">
              <p class="text-sm">{message.content}</p>
            </div>
            <div class="px-3 pb-2 {isOwnMessage(message.sender_id) ? 'text-white/60' : 'text-gray-400'} text-xs text-right">
              {formatTime(message.created_at)}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Input -->
  <div class="p-4 bg-white border-t">
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newMessage}
        on:keydown={handleKeydown}
        placeholder="Tapez votre message..."
        class="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <button
        on:click={handleSend}
        disabled={!newMessage.trim() || sending}
        class="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send class="w-5 h-5" />
      </button>
    </div>
  </div>
</div>
