<script lang="ts">
  import { WifiOff, Home, RefreshCw } from 'lucide-svelte';
</script>

<div class="min-h-screen bg-gradient-to-br from-primary/5 to-white flex items-center justify-center p-4">
  <div class="text-center max-w-md">
    <div class="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <WifiOff class="w-12 h-12 text-yellow-600" />
    </div>
    
    <h1 class="text-2xl font-bold mb-4">Vous êtes hors ligne</h1>
    <p class="text-gray-600 mb-8">
      Il semble que vous n'avez pas de connexion internet. 
      Certains fonctionnalités peuvent être limitées.
    </p>
    
    <div class="space-y-3">
      <a 
        href="/" 
        class="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
      >
        <Home class="w-5 h-5" />
        Retour à l'accueil
      </a>
      
      <button 
        on:click={() => window.location.reload()}
        class="flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <RefreshCw class="w-5 h-5" />
        Réessayer
      </button>
    </div>
  </div>
</div>
