<script lang="ts">
  import { supabase, type Profile } from '$lib/supabase/client';
  import { onMount } from 'svelte';
  import { Users, Search, Phone, Mail } from 'lucide-svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';

  export let data;
  export let params = {};

  let patients: Profile[] = [];
  let loading = true;
  let searchQuery = '';

  onMount(async () => {
    const { data: patientsData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .order('created_at', { ascending: false });

    if (patientsData) {
      patients = patientsData;
    }
    loading = false;
  });

  $: filteredPatients = patients.filter(p => 
    p.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.telephone?.includes(searchQuery)
  );
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Patients</h1>
      <p class="text-gray-500">Liste des patients inscrits</p>
    </div>
    <div class="text-sm text-gray-500">
      {patients.length} patient(s) enregistré(s)
    </div>
  </div>

  <!-- Search -->
  <div class="relative">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Rechercher un patient..."
      class="input-field pl-10"
    />
  </div>

  {#if loading}
    <div class="space-y-4">
      {#each Array(3) as _}
        <div class="h-20 bg-muted animate-pulse rounded-[var(--radius)]" />
      {/each}
    </div>
  {:else if filteredPatients.length === 0}
    <GlassCard glass={false} className="py-12 text-center">
      <Users class="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p class="text-gray-500">
        {searchQuery ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
      </p>
    </GlassCard>
  {:else}
    <div class="space-y-3">
      {#each filteredPatients as patient}
        <GlassCard glass={false} padding="p-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span class="font-semibold text-primary">
                {patient.nom?.charAt(0) || 'P'}
              </span>
            </div>
            <div class="flex-1">
              <p class="font-semibold">{patient.nom}</p>
              <div class="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                <div class="flex items-center gap-1">
                  <Mail class="w-4 h-4" />
                  {patient.email}
                </div>
                <div class="flex items-center gap-1">
                  <Phone class="w-4 h-4" />
                  {patient.telephone}
                </div>
              </div>
            </div>
            <div class="text-xs text-gray-400">
              Inscrit le {new Date(patient.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </GlassCard>
      {/each}
    </div>
  {/if}
</div>
