<script lang="ts">
  import { auth, type UserRole } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { Heart, Mail, Lock, User, Phone, ArrowLeft, Shield, Check } from 'lucide-svelte';


  export let data;
  export let params = {};

  let email = '';
  let password = '';
  let nom = '';
  let telephone = '';
  let role: UserRole = 'patient';
  let loading = false;
  let error = '';
  let agreeTerms = false;

  // En mode demo, seul le rôle patient est disponible
  const benefits = [
    { icon: '🚑', text: 'Professionnels qualifiés' },
    { icon: '⏱️', text: 'Intervention sous 24h' },
    { icon: '💰', text: 'Tarifs transparents' },
    { icon: '📱', text: 'Suivi en temps réel' }
  ];

  async function handleRegister() {
    if (!agreeTerms) {
      error = 'Veuillez accepter les conditions générales';
      return;
    }
    
    loading = true;
    error = '';

    await auth.signUp(email, password, nom, role);

    if (role === 'admin') goto('/dashboard/admin');
    else if (role === 'patient') goto('/dashboard/patient');
    else goto('/dashboard/pro');

    loading = false;
  }
</script>

<div class="min-h-screen flex">
  <!-- Left Panel - Benefits -->
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

    <div class="relative z-10 space-y-8">
      <h1 class="text-4xl font-bold leading-tight">
        Rejoignez-nous<br/>simplement.
      </h1>
      <p class="text-xl text-white/80">
        Créez votre compte en quelques secondes
      </p>
      
      <div class="grid grid-cols-2 gap-4 pt-4">
        {#each benefits as benefit}
          <div class="flex items-center gap-3">
            <span class="text-2xl">{benefit.icon}</span>
            <span class="text-white/90">{benefit.text}</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="relative z-10 text-white/60 text-sm">
      © 2024 SoinDirect. Tous droits réservés.
    </div>
  </div>

  <!-- Right Panel - Register Form -->
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
        <h1 class="text-2xl font-bold">Créer un compte</h1>
        <p class="text-gray-500 mt-1">Rejoignez SoinDirect</p>
      </div>

      <form on:submit|preventDefault={handleRegister} class="space-y-4">
        {#if error}
          <div class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        {/if}

        <div>
          <label for="nom" class="block text-sm font-medium text-gray-700 mb-1">
            Nom complet
          </label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="nom"
              bind:value={nom}
              class="input-field pl-10"
              placeholder="Votre nom"
              required
            />
          </div>
        </div>

        <div>
          <label for="telephone" class="block text-sm font-medium text-gray-700 mb-1">
            Téléphone
          </label>
          <div class="relative">
            <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              id="telephone"
              bind:value={telephone}
              class="input-field pl-10"
              placeholder="+225 07 00 00 00 00"
              required
            />
          </div>
        </div>

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
              placeholder="vous@email.com"
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
              minlength="6"
              required
            />
          </div>
        </div>

        <!-- Role selection - Patient only -->
        <div class="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <User class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-medium">Patient</p>
              <p class="text-sm text-gray-500">Je souhaite demander des soins à domicile</p>
            </div>
          </div>
        </div>

        <label class="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={agreeTerms}
            class="w-5 h-5 mt-0.5 rounded text-primary"
          />
          <span class="text-sm text-gray-600">
            J'accepte les <a href="#" class="text-primary hover:underline">conditions générales</a> 
            et la <a href="#" class="text-primary hover:underline">politique de confidentialité</a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          class="btn-primary w-full disabled:opacity-50 py-3"
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <p class="text-center mt-6 text-gray-600">
        Déjà inscrit ?
        <a href="/auth/login" class="text-primary font-semibold hover:underline">
          Se connecter
        </a>
      </p>
    </div>
  </div>
</div>
