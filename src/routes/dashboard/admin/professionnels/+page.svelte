<script lang="ts">
  import { supabase, type Profile } from '$lib/supabase/client';
  import { onMount } from 'svelte';
  import { Users, Plus, Shield, X } from 'lucide-svelte';

  export let data;
  export let params = {};

  let professionals: Profile[] = [];
  let showModal = false;
  let loading = false;

  // Form fields
  let nom = '';
  let email = '';
  let telephone = '';
  let specialite = 'ide';

  const specialites = [
    { value: 'ide', label: 'Infirmier(ère) Diplômé(e)' },
    { value: 'biologist', label: 'Biographe Médical' },
    { value: 'kine', label: 'Kinésithérapeute' }
  ];

  const roleLabels: Record<string, string> = {
    ide: 'Infirmier',
    biologist: 'Biographe',
    kine: 'Kinésithérapeute'
  };

  onMount(async () => {
    // In demo mode, show mock professionals
    professionals = [
      { id: '1', email: 'marie@demo.com', nom: 'Marie Dubois', telephone: '+225 07 00 000 001', role: 'ide', created_at: new Date().toISOString() },
      { id: '2', email: 'paul@demo.com', nom: 'Paul Koffi', telephone: '+225 07 00 000 002', role: 'biologist', created_at: new Date().toISOString() },
      { id: '3', email: 'anne@demo.com', nom: 'Anne Konan', telephone: '+225 07 00 000 003', role: 'kine', created_at: new Date().toISOString() }
    ];
  });

  function openModal() {
    showModal = true;
    nom = '';
    email = '';
    telephone = '';
    specialite = 'ide';
  }

  function closeModal() {
    showModal = false;
  }

  async function createProfessional() {
    loading = true;

    const newPro = {
      id: crypto.randomUUID(),
      email,
      nom,
      telephone,
      role: specialite as any,
      created_at: new Date().toISOString()
    };

    professionals = [...professionals, newPro];
    closeModal();
    loading = false;
  }

  function deleteProfessional(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce professionnel ?')) {
      professionals = professionals.filter(p => p.id !== id);
    }
  }
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Professionnels</h1>
    <button on:click={openModal} class="btn-primary flex items-center gap-2">
      <Plus class="w-5 h-5" />
      Ajouter un professionnel
    </button>
  </div>

  {#if professionals.length === 0}
    <div class="card text-center py-12">
      <Users class="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p class="text-gray-500">Aucun professionnel enregistré</p>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each professionals as pro}
        <div class="card flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="font-semibold">{pro.nom}</p>
              <p class="text-sm text-gray-500">{roleLabels[pro.role] || pro.role}</p>
              <p class="text-sm text-gray-400">{pro.email}</p>
            </div>
          </div>
          <button
            on:click={() => deleteProfessional(pro.id)}
            class="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal -->
{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" on:click={closeModal}></div>
    <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Nouveau professionnel</h2>

      <form on:submit|preventDefault={createProfessional} class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nom complet</label>
          <input type="text" bind:value={nom} class="input-field" required />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" bind:value={email} class="input-field" required />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Téléphone</label>
          <input type="tel" bind:value={telephone} class="input-field" required />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Spécialité</label>
          <select bind:value={specialite} class="input-field">
            {#each specialites as s}
              <option value={s.value}>{s.label}</option>
            {/each}
          </select>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" on:click={closeModal} class="flex-1 btn-secondary">
            Annuler
          </button>
          <button type="submit" disabled={loading} class="flex-1 btn-primary">
            {loading ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
