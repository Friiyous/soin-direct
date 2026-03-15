<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { supabase } from '$lib/supabase/client';
  import { MessageSquare, Send, User, Search } from 'lucide-svelte';

  interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
  }

  interface Conversation {
    id: string;
    participant_name: string;
    participant_role: string;
    last_message: string;
    last_message_time: string;
  }

  let conversations: Conversation[] = [
    {
      id: '1',
      participant_name: 'Marie Dubois',
      participant_role: 'Infirmière',
      last_message: 'Votre rendez-vous est confirmé pour demain 14h',
      last_message_time: '2 min'
    },
    {
      id: '2',
      participant_name: 'Dr. Amani Bernard',
      participant_role: 'Biologist',
      last_message: 'Vos résultats sont prêts',
      last_message_time: '1h'
    }
  ];

  let messages: Message[] = [
    {
      id: '1',
      sender_id: 'pro-1',
      receiver_id: 'patient-1',
      content: 'Bonjour, je vais effectuer votre soin demain à 14h',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      sender_id: 'patient-1',
      receiver_id: 'pro-1',
      content: 'Parfait, je serai disponible. Merci !',
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: '3',
      sender_id: 'pro-1',
      receiver_id: 'patient-1',
      content: 'Votre rendez-vous est confirmé pour demain 14h',
      created_at: new Date(Date.now() - 120000).toISOString()
    }
  ];

  let selectedConversation: Conversation | null = conversations[0];
  let newMessage = '';
  let searchQuery = '';

  function sendMessage() {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: crypto.randomUUID(),
      sender_id: 'patient-1',
      receiver_id: selectedConversation.id,
      content: newMessage,
      created_at: new Date().toISOString()
    };

    messages = [...messages, message];
    newMessage = '';
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="flex h-[calc(100vh-8rem)]">
  <!-- Conversations List -->
  <div class="w-1/3 border-r bg-white">
    <div class="p-4 border-b">
      <h2 class="text-xl font-bold mb-4">Messages</h2>
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          bind:value={searchQuery}
          class="w-full pl-10 pr-4 py-2 border rounded-xl text-sm"
        />
      </div>
    </div>

    <div class="overflow-y-auto h-[calc(100%-5rem)]">
      {#each conversations as conv}
        <button
          on:click={() => selectedConversation = conv}
          class="w-full p-4 text-left hover:bg-gray-50 border-b transition-colors
                 {selectedConversation?.id === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User class="w-6 h-6 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="font-semibold">{conv.participant_name}</p>
                <span class="text-xs text-gray-400">{conv.last_message_time}</span>
              </div>
              <p class="text-sm text-gray-500">{conv.participant_role}</p>
              <p class="text-sm text-gray-600 truncate">{conv.last_message}</p>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Chat Area -->
  <div class="flex-1 flex flex-col">
    {#if selectedConversation}
      <!-- Header -->
      <div class="p-4 border-b bg-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="font-semibold">{selectedConversation.participant_name}</p>
            <p class="text-sm text-green-500">En ligne</p>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {#each messages as msg}
          <div class="flex {msg.sender_id === 'patient-1' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[70%] {msg.sender_id === 'patient-1' 
              ? 'bg-primary text-white rounded-2xl rounded-br-md' 
              : 'bg-white border rounded-2xl rounded-bl-md'} p-3 shadow-sm">
              <p>{msg.content}</p>
              <p class="text-xs {msg.sender_id === 'patient-1' ? 'text-white/70' : 'text-gray-400'} mt-1">
                {formatTime(msg.created_at)}
              </p>
            </div>
          </div>
        {/each}
      </div>

      <!-- Input -->
      <div class="p-4 border-t bg-white">
        <form on:submit|preventDefault={sendMessage} class="flex gap-2">
          <input
            type="text"
            bind:value={newMessage}
            placeholder="Tapez votre message..."
            class="flex-1 px-4 py-3 border rounded-xl"
          />
          <button type="submit" class="btn-primary px-4">
            <Send class="w-5 h-5" />
          </button>
        </form>
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <MessageSquare class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Sélectionnez une conversation</p>
        </div>
      </div>
    {/if}
  </div>
</div>
