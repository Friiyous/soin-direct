<script lang="ts">
  import { supabase, type Mission, type Profile } from '$lib/supabase/client';
  import { onMount } from 'svelte';
  import { 
    ClipboardList, UserCheck, MapPin, Clock, AlertCircle, 
    Search, Filter, History, X, CheckCircle, XCircle
  } from 'lucide-svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

  export let data;
  export let params = {};

  let allMissions: any[] = [];
  let missions: any[] = [];
  let professionals: Profile[] = [];
  let loading = true;
  let selectedMission: any = null;
  let showAssignModal = false;
  let showHistoryModal = false;
  
  // Filtres
  let filterStatut = 'all';
  let filterType = 'all';
  let searchQuery = '';
  let showFilters = false;
  let showHistory = false;

  const soinLabels: Record<string, string> = {
    pansement: 'Pansement',
    tension: 'Mesure tension',
    prise_sang: 'Prise de sang',
    perfusion: 'Perfusion',
    injection: 'Injection',
    surveillance: 'Surveillance',
    autre: 'Autre'
  };

  const specialiteLabels: Record<string, string> = {
    ide: 'Infirmier(ère)',
    biologist: 'Biologue',
    kine: 'Kinésithérapeute'
  };

  const statutOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'accepte', label: 'Accepté' },
    { value: 'termine', label: 'Terminé' },
    { value: 'annule', label: 'Annulé' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'pansement', label: 'Pansement' },
    { value: 'tension', label: 'Tension' },
    { value: 'prise_sang', label: 'Prise de sang' },
    { value: 'perfusion', label: 'Perfusion' },
    { value: 'injection', label: 'Injection' },
    { value: 'surveillance', label: 'Surveillance' },
    { value: 'autre', label: 'Autre' }
  ];

  onMount(async () => {
    await loadData();
    loading = false;
  });

  async function loadData() {
    // Charger toutes les missions
    const { data: missionsData } = await supabase
      .from('missions')
      .select('*, patient:patients(user_id, profiles(nom, telephone, gps_lat, gps_lng)), professionnel:ordre_id(*)')
      .order('created_at', { ascending: false });

    if (missionsData) {
      allMissions = missionsData.map(m => ({
        ...m,
        patient_nom: m.patient?.profiles?.nom || 'Patient',
        patient_tel: m.patient?.profiles?.telephone || '',
        pro_nom: m.professionnel?.nom || null
      }));
      applyFilters();
    }

    // Charger les professionnels
    const { data: prosData } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['ide', 'biologist', 'kine']);

    if (prosData) {
      professionals = prosData;
    }
  }

  function applyFilters() {
    let filtered = [...allMissions];
    
    // Filtre par statut
    if (filterStatut !== 'all') {
      filtered = filtered.filter(m => m.statut === filterStatut);
    }
    
    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type_soin === filterType);
    }
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.patient_nom?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.pro_nom?.toLowerCase().includes(query)
      );
    }
    
    // Masquer l'historique si demandé
    if (!showHistory) {
      filtered = filtered.filter(m => m.statut !== 'termine' && m.statut !== 'annule');
    }
    
    missions = filtered;
  }

  $: {
    filterStatut;
    filterType;
    searchQuery;
    showHistory;
    applyFilters();
  }

  function openAssignModal(mission: any) {
    selectedMission = mission;
    showAssignModal = true;
  }

  function closeAssignModal() {
    showAssignModal = false;
    selectedMission = null;
  }

  function showMissionHistory(mission: any) {
    selectedMission = mission;
    showHistoryModal = true;
  }

  async function assignProfessional(proId: string) {
    if (!selectedMission) return;

    const pro = professionals.find(p => p.id === proId);
    
    const { error } = await supabase
      .from('missions')
      .update({ 
        ordre_id: proId,
        statut: 'accepte'
      })
      .eq('id', selectedMission.id);

    if (!error) {
      allMissions = allMissions.map(m => 
        m.id === selectedMission.id 
          ? { ...m, ordre_id: proId, pro_nom: pro?.nom, statut: 'accepte' }
          : m
      );
      applyFilters();
    }

    closeAssignModal();
  }

  async function markAsComplete(missionId: string) {
    const { error } = await supabase
      .from('missions')
      .update({ 
        statut: 'termine',
        date_acheve: new Date().toISOString()
      })
      .eq('id', missionId);

    if (!error) {
      allMissions = allMissions.map(m => 
        m.id === missionId ? { ...m, statut: 'termine', date_acheve: new Date().toISOString() } : m
      );
      applyFilters();
    }
  }

  async function cancelMission(missionId: string) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette mission ?')) return;
    
    const { error } = await supabase
      .from('missions')
      .update({ 
        statut: 'annule'
      })
      .eq('id', missionId);

    if (!error) {
      allMissions = allMissions.map(m => 
        m.id === missionId ? { ...m, statut: 'annule' } : m
      );
      applyFilters();
    }
  }

  function resetFilters() {
    filterStatut = 'all';
    filterType = 'all';
    searchQuery = '';
    showHistory = false;
  }

  $: statsCount = {
    total: allMissions.length,
    enAttente: allMissions.filter(m => m.statut === 'en_attente').length,
    accepte: allMissions.filter(m => m.statut === 'accepte').length,
    termine: allMissions.filter(m => m.statut === 'termine').length,
    annule: allMissions.filter(m => m.statut === 'annule').length
  };
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold">Gestion des missions</h1>
      <p class="text-gray-500">Assignez les demandes aux professionnels</p>
    </div>
    <div class="flex items-center gap-2">
      <button 
        on:click={() => showFilters = !showFilters}
        class="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
      >
        <Filter class="w-4 h-4" />
        Filtres
      </button>
      <button 
        on:click={() => showHistory = !showHistory}
        class="flex items-center gap-2 px-4 py-2 {showHistory ? 'bg-primary text-white' : 'bg-white border'} rounded-lg"
      >
        <History class="w-4 h-4" />
        {showHistory ? 'Masquer historique' : 'Voir historique'}
      </button>
    </div>
  </div>

  <!-- Stats rapides -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
    <button 
      on:click={() => { filterStatut = 'all'; showHistory = false; }}
      class="p-3 rounded-lg text-center {filterStatut === 'all' && !showHistory ? 'bg-primary text-white' : 'bg-white border'}"
    >
      <p class="text-2xl font-bold">{statsCount.total}</p>
      <p class="text-xs">Total</p>
    </button>
    <button 
      on:click={() => { filterStatut = 'en_attente'; showHistory = false; }}
      class="p-3 rounded-lg text-center {filterStatut === 'en_attente' ? 'bg-yellow-500 text-white' : 'bg-white border'}"
    >
      <p class="text-2xl font-bold">{statsCount.enAttente}</p>
      <p class="text-xs">En attente</p>
    </button>
    <button 
      on:click={() => { filterStatut = 'accepte'; showHistory = false; }}
      class="p-3 rounded-lg text-center {filterStatut === 'accepte' ? 'bg-blue-500 text-white' : 'bg-white border'}"
    >
      <p class="text-2xl font-bold">{statsCount.accepte}</p>
      <p class="text-xs">En cours</p>
    </button>
    <button 
      on:click={() => { filterStatut = 'termine'; showHistory = true; }}
      class="p-3 rounded-lg text-center {filterStatut === 'termine' ? 'bg-green-500 text-white' : 'bg-white border'}"
    >
      <p class="text-2xl font-bold">{statsCount.termine}</p>
      <p class="text-xs">Terminées</p>
    </button>
    <button 
      on:click={() => { filterStatut = 'annule'; showHistory = true; }}
      class="p-3 rounded-lg text-center {filterStatut === 'annule' ? 'bg-red-500 text-white' : 'bg-white border'}"
    >
      <p class="text-2xl font-bold">{statsCount.annule}</p>
      <p class="text-xs">Annulées</p>
    </button>
  </div>

  <!-- Filtres avancés -->
  {#if showFilters}
    <GlassCard glass={false} padding="p-4">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-1">Rechercher</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Patient, description, professionnel..."
              class="input-field pl-10"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Statut</label>
          <select bind:value={filterStatut} class="input-field">
            {#each statutOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Type de soin</label>
          <select bind:value={filterType} class="input-field">
            {#each typeOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
        <button on:click={resetFilters} class="btn-secondary">
          Réinitialiser
        </button>
      </div>
    </GlassCard>
  {/if}

  {#if loading}
    <div class="space-y-4">
      {#each Array(3) as _}
        <div class="h-32 bg-muted animate-pulse rounded-[var(--radius)]" />
      {/each}
    </div>
  {:else if missions.length === 0}
    <GlassCard glass={false} className="py-12 text-center">
      <ClipboardList class="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p class="text-gray-500">Aucune mission trouvée</p>
    </GlassCard>
  {:else}
    <div class="space-y-4">
      {#each missions as mission}
        <GlassCard glass={false} padding="p-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <!-- Info mission -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2 flex-wrap">
                <span class="font-bold text-lg">{soinLabels[mission.type_soin] || mission.type_soin}</span>
                <StatusBadge status={mission.statut} />
              </div>
              
              <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                <div class="flex items-center gap-1">
                  <Clock class="w-4 h-4" />
                  {new Date(mission.date_prevue).toLocaleDateString('fr-FR', { 
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
                {#if mission.patient_nom}
                  <div class="flex items-center gap-1">
                    <MapPin class="w-4 h-4" />
                    {mission.patient_nom}
                  </div>
                {/if}
                {#if mission.pro_nom}
                  <div class="flex items-center gap-1 text-green-600">
                    <UserCheck class="w-4 h-4" />
                    {mission.pro_nom}
                  </div>
                {/if}
              </div>

              {#if mission.description}
                <p class="mt-2 text-sm text-gray-600">{mission.description}</p>
              {/if}
              
              {#if mission.date_acheve}
                <p class="mt-2 text-xs text-gray-400">
                  Terminé le: {new Date(mission.date_acheve).toLocaleDateString('fr-FR')}
                </p>
              {/if}
            </div>

            <!-- Actions -->
            <div class="flex gap-2 flex-wrap">
              {#if mission.statut === 'en_attente'}
                <button 
                  on:click={() => openAssignModal(mission)}
                  class="btn-primary flex items-center gap-2"
                >
                  <UserCheck class="w-4 h-4" />
                  Assigner
                </button>
                <button 
                  on:click={() => cancelMission(mission.id)}
                  class="px-4 py-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 flex items-center gap-2"
                >
                  <XCircle class="w-4 h-4" />
                  Annuler
                </button>
              {:else if mission.statut === 'accepte'}
                <button 
                  on:click={() => markAsComplete(mission.id)}
                  class="btn-primary flex items-center gap-2"
                >
                  <CheckCircle class="w-4 h-4" />
                  Terminer
                </button>
              {/if}
              <button 
                on:click={() => showMissionHistory(mission)}
                class="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <History class="w-4 h-4" />
                Détails
              </button>
            </div>
          </div>
        </GlassCard>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal Assignation -->
{#if showAssignModal && selectedMission}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" on:click={closeAssignModal}></div>
    <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Assigner un professionnel</h2>
        <button on:click={closeAssignModal} class="p-1 hover:bg-gray-100 rounded">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <p class="text-sm text-gray-500 mb-4">
        Type de soin: <strong>{soinLabels[selectedMission.type_soin]}</strong>
      </p>

      <div class="space-y-3">
        {#each professionals as pro}
          <button
            on:click={() => assignProfessional(pro.id)}
            class="w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <div class="font-medium">{pro.nom}</div>
            <div class="text-sm text-gray-500">{specialiteLabels[pro.role] || pro.role}</div>
            <div class="text-sm text-gray-400">{pro.telephone}</div>
          </button>
        {/each}

        {#if professionals.length === 0}
          <p class="text-center text-gray-500 py-4">
            Aucun professionnel disponible.
          </p>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Modal Historique -->
{#if showHistoryModal && selectedMission}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" on:click={() => showHistoryModal = false}></div>
    <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Détails de la mission</h2>
        <button on:click={() => showHistoryModal = false} class="p-1 hover:bg-gray-100 rounded">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="text-sm text-gray-500">Type de soin</label>
          <p class="font-semibold">{soinLabels[selectedMission.type_soin]}</p>
        </div>
        
        <div>
          <label class="text-sm text-gray-500">Statut</label>
          <div class="mt-1"><StatusBadge status={selectedMission.statut} /></div>
        </div>
        
        <div>
          <label class="text-sm text-gray-500">Patient</label>
          <p class="font-semibold">{selectedMission.patient_nom}</p>
          <p class="text-sm text-gray-500">{selectedMission.patient_tel}</p>
        </div>
        
        {#if selectedMission.pro_nom}
          <div>
            <label class="text-sm text-gray-500">Professionnel assigné</label>
            <p class="font-semibold">{selectedMission.pro_nom}</p>
          </div>
        {/if}
        
        <div>
          <label class="text-sm text-gray-500">Description</label>
          <p>{selectedMission.description || 'Aucune'}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-500">Date prévue</label>
            <p class="font-semibold">{new Date(selectedMission.date_prevue).toLocaleDateString('fr-FR')}</p>
          </div>
          {#if selectedMission.date_acheve}
            <div>
              <label class="text-sm text-gray-500">Date terminée</label>
              <p class="font-semibold">{new Date(selectedMission.date_acheve).toLocaleDateString('fr-FR')}</p>
            </div>
          {/if}
        </div>
        
        <div>
          <label class="text-sm text-gray-500">Créée le</label>
          <p class="font-semibold">{new Date(selectedMission.created_at).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
      
      <button on:click={() => showHistoryModal = false} class="mt-6 w-full btn-secondary">
        Fermer
      </button>
    </div>
  </div>
{/if}
