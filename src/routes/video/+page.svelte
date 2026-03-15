<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { 
    Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
    Maximize2, MessageSquare, Settings, User
  } from 'lucide-svelte';
  import { videoCall } from '$lib/stores/videoCall';
  import Button from '$lib/components/ui/Button.svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';

  let localVideo: HTMLVideoElement;
  let remoteVideo: HTMLVideoElement;
  let isStarting = true;
  let error = '';
  let showChat = false;

  $: if (localVideo && $videoCall.localStream) {
    localVideo.srcObject = $videoCall.localStream;
  }

  $: if (remoteVideo && $videoCall.remoteStream) {
    remoteVideo.srcObject = $videoCall.remoteStream;
  }

  onMount(async () => {
    await videoCall.startLocalStream();
    isStarting = false;
  });

  onDestroy(() => {
    videoCall.endCall();
  });

  function handleEndCall() {
    videoCall.endCall();
    window.history.back();
  }

  function toggleMute() {
    videoCall.toggleMute();
  }

  function toggleVideo() {
    videoCall.toggleVideo();
  }
</script>

<div class="fixed inset-0 bg-gray-900 z-50 flex flex-col">
  <!-- Header -->
  <div class="h-16 bg-black/50 flex items-center justify-between px-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
        <User class="w-5 h-5 text-white" />
      </div>
      <div>
        <p class="text-white font-semibold">Dr. Konan Jean</p>
        <p class="text-gray-400 text-sm">En ligne</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-green-500 flex items-center gap-2">
        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        12:34
      </span>
    </div>
  </div>

  <!-- Videos -->
  <div class="flex-1 relative">
    <!-- Remote Video (Full Screen) -->
    <div class="absolute inset-0 bg-gray-800">
      {#if $videoCall.remoteStream}
        <video 
          bind:this={remoteVideo}
          autoplay 
          playsinline 
          class="w-full h-full object-cover"
        ></video>
      {:else}
        <div class="w-full h-full flex items-center justify-center">
          <div class="text-center">
            <div class="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User class="w-16 h-16 text-gray-500" />
            </div>
            <p class="text-gray-400">En attente de la connexion...</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Local Video (Picture-in-Picture) -->
    <div class="absolute bottom-24 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-600 shadow-lg">
      {#if $videoCall.localStream}
        <video 
          bind:this={localVideo}
          autoplay 
          playsinline 
          muted
          class="w-full h-full object-cover {$videoCall.isVideoOff ? 'hidden' : ''}"
        ></video>
      {/if}
      {#if $videoCall.isVideoOff}
        <div class="w-full h-full bg-gray-800 flex items-center justify-center">
          <VideoOff class="w-8 h-8 text-gray-500" />
        </div>
      {/if}
    </div>
  </div>

  <!-- Controls -->
  <div class="h-24 bg-black/80 flex items-center justify-center gap-4">
    <button 
      on:click={toggleMute}
      class="w-14 h-14 rounded-full flex items-center justify-center transition-colors
        {$videoCall.isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}"
    >
      {#if $videoCall.isMuted}
        <MicOff class="w-6 h-6 text-white" />
      {:else}
        <Mic class="w-6 h-6 text-white" />
      {/if}
    </button>

    <button 
      on:click={toggleVideo}
      class="w-14 h-14 rounded-full flex items-center justify-center transition-colors
        {$videoCall.isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}"
    >
      {#if $videoCall.isVideoOff}
        <VideoOff class="w-6 h-6 text-white" />
      {:else}
        <Video class="w-6 h-6 text-white" />
      {/if}
    </button>

    <button 
      on:click={handleEndCall}
      class="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
    >
      <PhoneOff class="w-6 h-6 text-white" />
    </button>

    <button 
      on:click={() => showChat = !showChat}
      class="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
    >
      <MessageSquare class="w-6 h-6 text-white" />
    </button>

    <button class="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
      <Settings class="w-6 h-6 text-white" />
    </button>
  </div>
</div>

<!-- Chat Sidebar -->
{#if showChat}
  <div class="fixed right-0 top-16 bottom-24 w-80 bg-gray-800 z-40 flex flex-col">
    <div class="p-4 border-b border-gray-700">
      <h3 class="text-white font-semibold">Messages</h3>
    </div>
    <div class="flex-1 p-4 overflow-y-auto">
      <p class="text-gray-500 text-center text-sm">Aucun message</p>
    </div>
    <div class="p-4 border-t border-gray-700">
      <input 
        type="text" 
        placeholder="Tapez un message..."
        class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
      />
    </div>
  </div>
{/if}
