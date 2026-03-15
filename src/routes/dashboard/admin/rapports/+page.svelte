<script lang="ts">
  import { supabase } from '$lib/supabase/client';
  import { onMount } from 'svelte';
  import { 
    BarChart3, TrendingUp, Users, Calendar, Download, 
    Filter, Printer, Eye, EyeOff
  } from 'lucide-svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';

  export let data;
  export let params = {};

  let loading = true;
  let showReport = false;
  
  // Filtres
  let dateDebut = '';
  let dateFin = '';
  let typeProfessionnel = 'all';

  // Données
  let stats = {
    totalMissions: 0,
    missionsTerminees: 0,
    tauxCompletion: 0,
    avgPerDay: 0,
    topPro: '',
    topType: ''
  };
  
  let missionsByDay: Record<string, number> = {};
  let missionsByType: Record<string, number> = {};
  let missionsByPro: Record<string, number> = {};
  let missionsByMonth: Record<string, number> = {};
  let prosPerformance: { nom: string; count: number }[] = [];

  const soinLabels: Record<string, string> = {
    pansement: 'Pansement',
    tension: 'Tension',
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

  const typeColors: Record<string, string> = {
    pansement: 'bg-blue-500',
    tension: 'bg-green-500',
    prise_sang: 'bg-purple-500',
    perfusion: 'bg-orange-500',
    injection: 'bg-pink-500',
    surveillance: 'bg-yellow-500',
    autre: 'bg-gray-500'
  };

  onMount(() => {
    // Défaut: dernier mois
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    dateFin = today.toISOString().split('T')[0];
    dateDebut = lastMonth.toISOString().split('T')[0];
    
    loadReport();
  });

  async function loadReport() {
    loading = true;
    showReport = true;

    let query = supabase
      .from('missions')
      .select('*');

    if (dateDebut) {
      query = query.gte('created_at', dateDebut);
    }
    if (dateFin) {
      const endDate = new Date(dateFin);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    const { data: missions } = await query;

    if (missions && missions.length > 0) {
      // Stats globales
      const terminees = missions.filter(m => m.statut === 'termine').length;
      stats.totalMissions = missions.length;
      stats.missionsTerminees = terminees;
      stats.tauxCompletion = Math.round((terminees / missions.length) * 100);

      // Jours
      missions.forEach(m => {
        const date = new Date(m.created_at).toLocaleDateString('fr-FR');
        missionsByDay[date] = (missionsByDay[date] || 0) + 1;
      });

      // Types
      missions.forEach(m => {
        missionsByType[m.type_soin] = (missionsByType[m.type_soin] || 0) + 1;
      });

      // Mois
      missions.forEach(m => {
        const month = new Date(m.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        missionsByMonth[month] = (missionsByMonth[month] || 0) + 1;
      });

      // Par professionnel
      missions.forEach(m => {
        if (m.ordre_id) {
          missionsByPro[m.ordre_id] = (missionsByPro[m.ordre_id] || 0) + 1;
        }
      });

      // Top professionnel
      const topProId = Object.entries(missionsByPro).sort((a, b) => b[1] - a[1])[0];
      if (topProId) {
        const { data: pro } = await supabase
          .from('profiles')
          .select('nom')
          .eq('id', topProId[0])
          .single();
        stats.topPro = pro?.nom || 'N/A';
      }

      // Top type
      const topType = Object.entries(missionsByType).sort((a, b) => b[1] - a[1])[0];
      stats.topType = soinLabels[topType?.[0]] || topType?.[0] || 'N/A';

      // Moyenne par jour
      const days = Object.keys(missionsByDay).length || 1;
      stats.avgPerDay = (missions.length / days).toFixed(1);

      // Performance des pros
      const prosIds = Object.keys(missionsByPro);
      for (const proId of prosIds) {
        const { data: pro } = await supabase
          .from('profiles')
          .select('nom')
          .eq('id', proId)
          .single();
        if (pro) {
          prosPerformance.push({
            nom: pro.nom,
            count: missionsByPro[proId]
          });
        }
      }
      prosPerformance = prosPerformance.sort((a, b) => b.count - a.count);
    }

    loading = false;
  }

  function printReport() {
    window.print();
  }

  function exportCSV() {
    // Simple CSV export
    let csv = 'Date,Type,Statut,Patient,Professionnel\n';
    
    Object.entries(missionsByDay).forEach(([date, count]) => {
      csv += `${date},${count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_soindirect_${dateDebut}_${dateFin}.csv`;
    a.click();
  }

  $: maxDayCount = Math.max(...Object.values(missionsByDay), 1);
  $: maxTypeCount = Math.max(...Object.values(missionsByType), 1);
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold">Rapports & Statistiques</h1>
      <p class="text-gray-500">Analysez les performances de la plateforme</p>
    </div>
    <div class="flex gap-2">
      <button on:click={printReport} class="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
        <Printer class="w-4 h-4" />
        Imprimer
      </button>
      <button on:click={exportCSV} class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
        <Download class="w-4 h-4" />
        Exporter
      </button>
    </div>
  </div>

  <!-- Filtres -->
  <GlassCard glass={false} padding="p-4">
    <div class="flex flex-wrap gap-4 items-end">
      <div>
        <label class="block text-sm font-medium mb-1">Date de début</label>
        <input type="date" bind:value={dateDebut} class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Date de fin</label>
        <input type="date" bind:value={dateFin} class="input-field" />
      </div>
      <button on:click={loadReport} class="btn-primary">
        <Filter class="w-4 h-4 mr-2" />
        Générer le rapport
      </button>
    </div>
  </GlassCard>

  {#if loading}
    <div class="grid md:grid-cols-4 gap-4">
      {#each Array(4) as _}
        <div class="h-32 bg-muted animate-pulse rounded-[var(--radius)]" />
      {/each}
    </div>
  {:else if !showReport}
    <GlassCard glass={false} className="py-12 text-center">
      <BarChart3 class="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p class="text-gray-500">Sélectionnez une période et cliquez sur "Générer le rapport"</p>
    </GlassCard>
  {:else if stats.totalMissions === 0}
    <GlassCard glass={false} className="py-12 text-center">
      <BarChart3 class="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p class="text-gray-500">Aucune mission trouvée pour cette période</p>
    </GlassCard>
  {:else}
    <!-- Stats principales -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <GlassCard padding="p-4" className="text-center">
        <BarChart3 class="w-8 h-8 mx-auto text-blue-500 mb-2" />
        <p class="text-3xl font-black">{stats.totalMissions}</p>
        <p class="text-xs text-gray-500">Total missions</p>
      </GlassCard>
      
      <GlassCard padding="p-4" className="text-center">
        <TrendingUp class="w-8 h-8 mx-auto text-green-500 mb-2" />
        <p class="text-3xl font-black">{stats.tauxCompletion}%</p>
        <p class="text-xs text-gray-500">Taux de complétion</p>
      </GlassCard>

      <GlassCard padding="p-4" className="text-center">
        <Calendar class="w-8 h-8 mx-auto text-purple-500 mb-2" />
        <p class="text-3xl font-black">{stats.avgPerDay}</p>
        <p class="text-xs text-gray-500">Moyenne/jour</p>
      </GlassCard>

      <GlassCard padding="p-4" className="text-center">
        <Users class="w-8 h-8 mx-auto text-orange-500 mb-2" />
        <p class="text-xl font-black">{stats.topPro}</p>
        <p class="text-xs text-gray-500">Meilleur pro</p>
      </GlassCard>
    </div>

    <!-- Graphiques -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Missions par jour -->
      <GlassCard padding="p-4">
        <h3 class="text-lg font-bold mb-4">Missions par jour</h3>
        <div class="space-y-2">
          {#each Object.entries(missionsByDay).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).slice(0, 10) as [date, count]}
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500 w-24">{date}</span>
              <div class="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary rounded-full"
                  style="width: {(count / maxDayCount) * 100}%"
                ></div>
              </div>
              <span class="text-sm font-semibold w-8 text-right">{count}</span>
            </div>
          {/each}
        </div>
      </GlassCard>

      <!-- Missions par type -->
      <GlassCard padding="p-4">
        <h3 class="text-lg font-bold mb-4">Par type de soin</h3>
        <div class="space-y-3">
          {#each Object.entries(missionsByType).sort((a, b) => b[1] - a[1]) as [type, count]}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full {typeColors[type] || 'bg-gray-500'}"></div>
                <span class="text-sm">{soinLabels[type] || type}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full {typeColors[type] || 'bg-gray-500'} rounded-full"
                    style="width: {(count / maxTypeCount) * 100}%"
                  ></div>
                </div>
                <span class="text-sm font-semibold w-8 text-right">{count}</span>
              </div>
            </div>
          {/each}
        </div>
      </GlassCard>
    </div>

    <!-- Performance des professionnels -->
    <GlassCard padding="p-4">
      <h3 class="text-lg font-bold mb-4">Performance des professionnels</h3>
      {#if prosPerformance.length === 0}
        <p class="text-gray-500 text-center py-4">Aucune donnée</p>
      {:else}
        <div class="space-y-3">
          {#each prosPerformance as pro, i}
            <div class="flex items-center gap-4">
              <span class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <div class="flex-1">
                <div class="flex justify-between mb-1">
                  <span class="font-medium">{pro.nom}</span>
                  <span class="text-sm text-gray-500">{pro.count} missions</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-green-500 rounded-full"
                    style="width: {(pro.count / Math.max(...prosPerformance.map(p => p.count))) * 100}%"
                  ></div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </GlassCard>

    <!-- Stats supplémentaires -->
    <div class="grid md:grid-cols-2 gap-6">
      <GlassCard padding="p-4">
        <h3 class="text-lg font-bold mb-4">Informations clés</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-600">Type de soin le plus populaire</span>
            <span class="font-semibold">{stats.topType}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-600">Missions terminées</span>
            <span class="font-semibold text-green-600">{stats.missionsTerminees}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-600">Professionnel le plus actif</span>
            <span class="font-semibold">{stats.topPro}</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="p-4">
        <h3 class="text-lg font-bold mb-4">Période</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-600">Date de début</span>
            <span class="font-semibold">{dateDebut ? new Date(dateDebut).toLocaleDateString('fr-FR') : '-'}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-600">Date de fin</span>
            <span class="font-semibold">{dateFin ? new Date(dateFin).toLocaleDateString('fr-FR') : '-'}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-600">Jours analysés</span>
            <span class="font-semibold">{Object.keys(missionsByDay).length}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  {/if}
</div>

<style>
  @media print {
    button, .no-print {
      display: none !important;
    }
  }
</style>
