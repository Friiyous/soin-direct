<script lang="ts">
  import { supabase, type Mission } from '$lib/supabase/client';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { Video, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-svelte';

  export let data;
  export let params = {};

  let missions: Mission[] = [];
  let loading = true;
  let accepting: string | null = null;

  const statusConfig = {
    en_attente: { label: 'En attente', color: 'text-yellow-600 bg-yellow-50' },
    accepte: { label: 'Accepté', color: 'text-blue-600 bg-blue-50' },
    termine: { label: 'Terminé', color: 'text-green-600 bg-green-50' }
  };

  const soinLabels: Record<string, string> = {
    pansement: 'Pansement',
    tension: 'Tension',
    prise_sang: 'Prise de sang',
    perfusion: 'Perfusion',
    injection: 'Injection',
    surveillance: 'Surveillance',
    autre: 'Autre'
  };

  onMount(async () => {
    if (!$auth.user) return;

    // Get professional ID
    const { data: proData } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', $auth.user.id)
      .single();

    if (!proData) {
      loading = false;
      return;
    }

    // Charger uniquement les missions assignées à ce professionnel
    const { data } = await supabase
      .from('missions')
      .select(`
        *,
        patient:patients(
          user_id,
          adresse,
          gps_lat,
          gps_lng,
          profile:profiles(nom, telephone)
        )
      `)
      .eq('ordre_id', proData.id)
      .eq('statut', 'accepte')
      .order('date_prevue', { ascending: true });

    if (data) missions = data;
    loading = false;
  });

  async function completeMission(missionId: string) {
    accepting = missionId;

    await supabase.from('missions').update({
      statut: 'termine',
      date_acheve: new Date().toISOString()
    }).eq('id', missionId);

    // Retirer de la liste
    missions = missions.filter(m => m.id !== missionId);
    accepting = null;
  }

  // Calcul distance simple (approximative)
  function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
</script>

<div>
  <h1 class="text-2xl font-bold mb-6">Missions disponibles</h1>

  {#if loading}
    <div class="text-center py-12">
      <Loader2 class="w-8 h-8 animate-spin mx-auto text-primary" />
      <p class="mt-2 text-gray-500">Chargement des missions...</p>
    </div>
  {:else if missions.length === 0}
    <div class="card text-center py-12">
      <CheckCircle class="w-12 h-12 mx-auto text-green-500 mb-4" />
      <p class="text-gray-600">Aucune mission disponible pour le moment.</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each missions as mission}
        <div class="card">
          <div class="flex items-start justify-between mb-4">
            <div>
              <span class="px-3 py-1 rounded-full text-sm font-medium {statusConfig[mission.statut].color}">
                {statusConfig[mission.statut].label}
              </span>
              <h3 class="font-semibold text-lg mt-2">
                {soinLabels[mission.type_soin] || mission.type_soin}
              </h3>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-1 text-gray-500 text-sm">
                <Clock class="w-4 h-4" />
                {new Date(mission.date_prevue).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          {#if mission.patient}
            <div class="bg-gray-50 rounded-xl p-4 mb-4">
              <p class="font-medium">{mission.patient.profile?.nom || 'Patient'}</p>
              {#if mission.patient.adresse}
                <div class="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin class="w-4 h-4" />
                  {mission.patient.adresse}
                </div>
              {/if}
              {#if mission.patient.gps_lat && mission.patient.gps_lng}
                <p class="text-sm text-primary mt-1">
                  Position enregistrée
                </p>
              {/if}
            </div>
          {/if}

          {#if mission.description}
            <p class="text-gray-600 text-sm mb-4">{mission.description}</p>
          {/if}

          <div class="flex gap-2">
            <a
              href="/video"
              class="flex-1 btn-primary bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <Video class="w-5 h-5" />
              Appeler
            </a>
            <button
              on:click={() => completeMission(mission.id)}
              disabled={accepting === mission.id}
              class="flex-1 btn-secondary disabled:opacity-50"
            >
              {#if accepting === mission.id}
                <Loader2 class="w-5 h-5 animate-spin inline mr-2" />
              {/if}
              Terminé
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
