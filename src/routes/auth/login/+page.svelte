<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { Heart, Mail, Lock, ArrowLeft, Shield, User } from 'lucide-svelte';

  export let data;
  export let params = {};

  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  let selectedRole = 'patient';

  const demoAccounts = [
    { email: 'patient@demo.com', role: 'patient', label: 'Patient', icon: User, color: 'bg-green-500' },
    { email: 'admin@demo.com', role: 'admin', label: 'Administrateur', icon: Shield, color: 'bg-purple-500' }
  ];

  async function handleLogin() {
    loading = true;
    error = '';

    const { error: authError } = await auth.signIn(email, password);

    if (authError) {
      error = authError.message;
    } else {
      // Redirect based on role
      const user = await new Promise(resolve => {
        auth.subscribe(state => resolve(state.user))();
      });

      if (user?.role === 'admin') goto('/dashboard/admin');
      else if (user?.role === 'patient') {
        // Check if first login (onboarding)
        const hasSeenOnboarding = localStorage.getItem('onboarding_complete');
        if (!hasSeenOnboarding) {
          goto('/dashboard/patient/onboarding');
        } else {
          goto('/dashboard/patient');
        }
      }
      else goto('/dashboard/pro');
    }
    loading = false;
  }

  async function selectDemo(account: typeof demoAccounts[0]) {
    email = account.email;
    password = 'demo123';
    selectedRole = account.role;
    
    // Auto-login on demo account selection
    await handleLogin();
  }
</script>

<div class="min-h-screen flex">
  <!-- Left Panel - Branding -->
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white p-12 flex-col justify-between relative overflow-hidden">
    <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
    <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
    
    <div class="relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <Heart class="w-7 h-7" />
        </div>
        <span class="text-2xl font-bold">SoinDirect</span>
      </div>
    </div>

    <div class="relative z-10 space-y-6">
      <h1 class="text-4xl font-bold leading-tight">
        Vos soins à domicile,<br/>simplifiés.
      </h1>
      <p class="text-xl text-white/80">
        Accédez à des professionnels de santé qualifiés en quelques clics.
      </p>
      
      <div class="grid grid-cols-3 gap-4 pt-8">
        <div class="text-center">
          <div class="text-3xl font-bold">24h</div>
          <div class="text-sm text-white/70">Délai moyen</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold">50+</div>
          <div class="text-sm text-white/70">Pro PORO</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold">98%</div>
          <div class="text-sm text-white/70">Satisfaction</div>
        </div>
      </div>
    </div>

    <div class="relative z-10 text-white/60 text-sm">
      © 2024 SoinDirect. Tous droits réservés.
    </div>
  </div>

  <!-- Right Panel - Login Form -->
  <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
    <div class="w-full max-w-md">
      <a href="/" class="flex items-center gap-2 text-gray-500 hover:text-primary mb-8">
        <ArrowLeft class="w-4 h-4" />
        Retour à l'accueil
      </a>

      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Heart class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold">Bon retour !</h1>
        <p class="text-gray-500 mt-1">Connectez-vous à votre compte</p>
      </div>

      <!-- Demo Accounts -->
      <div class="mb-6">
        <p class="text-sm text-gray-500 mb-3">Compte démo - Cliquez pour sélectionner :</p>
        <div class="grid grid-cols-3 gap-2">
          {#each demoAccounts as account}
            <button
              type="button"
              on:click={() => selectDemo(account)}
              class="p-3 rounded-xl border-2 text-center transition-all hover:shadow-md
                     {selectedRole === account.role 
                       ? 'border-primary bg-primary/5' 
                       : 'border-gray-200 hover:border-primary/50'}"
            >
              <div class="w-10 h-10 {account.color} rounded-full flex items-center justify-center mx-auto mb-2">
                <svelte:component this={account.icon} class="w-5 h-5 text-white" />
              </div>
              <p class="text-xs font-medium">{account.label}</p>
            </button>
          {/each}
        </div>
      </div>

      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        {#if error}
          <div class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        {/if}

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              bind:value={email}
              class="input-field pl-10"
              placeholder="votre@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              id="password"
              bind:value={password}
              class="input-field pl-10"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="btn-primary w-full disabled:opacity-50 py-3"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p class="text-center mt-6 text-gray-600">
        Pas de compte ?
        <a href="/auth/register" class="text-primary font-semibold hover:underline">
          S'inscrire
        </a>
      </p>
    </div>
  </div>
</div>
