<script lang="ts">
  import { supabase, type Mission, type Profile } from '$lib/supabase/client';
  import { onMount } from 'svelte';
  
  export let data;
  export let params = {};
  import { 
    Users, ClipboardList, CheckCircle, Clock, TrendingUp, 
    Activity, AlertTriangle, Calendar, DollarSign, RefreshCw,
    Download, Eye, TrendingDown, Award, Target, Zap
  } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import Chart from 'chart.js/auto';

  let revenueCanvas: HTMLCanvasElement;
  let typeCanvas: HTMLCanvasElement;
  let revenueChart: Chart;
  let typeChart: Chart;

  let stats = {
    totalPatients: 0,
    totalPros: 0,
    totalMissions: 0,
    missionsEnAttente: 0,
    missionsAcceptees: 0,
    missionsTerminees: 0,
    missionsAnnulees: 0,
    tauxCompletion: 0,
    missionsCeMois: 0,
    prosActifs: 0,
    nouveauxPatients: 0,
    nouveauxPros: 0,
    avgMissionsPerPatient: 0
  };
  let recentMissions: any[] = [];
  let pendingPros: Profile[] = [];
  let loading = true;
  let lastUpdate = new Date();
  let activeTab = 'overview';

  // Données pour les graphiques
  let missionsByDay: { date: string; count: number }[] = [];
  let missionsByType: Record<string, number> = {};
  let revenueByMonth: { month: string; revenue: number }[] = [];

  const soinLabels: Record<string, string> = {
    pansement: 'Pansement',
    tension: 'Tension',
    prise_sang: 'Prise de sang',
    perfusion: 'Perfusion',
    injection: 'Injection',
    surveillance: 'Surveillance',
    autre: 'Autre'
  };

  // Prix des services (en francs CFA)
  const servicePrices: Record<string, number> = {
    pansement: 15000,
    tension: 5000,
    prise_sang: 10000,
    perfusion: 25000,
    injection: 8000,
    surveillance: 20000,
    autre: 10000
  };

  onMount(async () => {
    await loadStats();
    loading = false;
  });

  async function loadStats() {
    const [
      patientsCount, prosCount, missionsTotal, attenteCount, 
      accepteCount, termineCount, annuleCount, missionsThisMonth,
      prosActifs, newPatients, newPros
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'patient'),
      supabase.from('profiles').select('id', { count: 'exact' }).in('role', ['ide', 'biologist', 'kine']),
      supabase.from('missions').select('id', { count: 'exact' }),
      supabase.from('missions').select('id', { count: 'exact' }).eq('statut', 'en_attente'),
      supabase.from('missions').select('id', { count: 'exact' }).eq('statut', 'accepte'),
      supabase.from('missions').select('id', { count: 'exact' }).eq('statut', 'termine'),
      supabase.from('missions').select('id', { count: 'exact' }).eq('statut', 'annule'),
      supabase.from('missions').select('id', { count: 'exact' }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from('missions').select('pro_id', { count: 'exact' }).eq('statut', 'accepte').not('pro_id', 'is', null),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'patient').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('profiles').select('id', { count: 'exact' }).in('role', ['ide', 'biologist', 'kine']).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const totalMissions = missionsTotal.count || 0;
    const terminees = termineCount.count || 0;

    stats = {
      totalPatients: patientsCount.count || 0,
      totalPros: prosCount.count || 0,
      totalMissions,
      missionsEnAttente: attenteCount.count || 0,
      missionsAcceptees: accepteCount.count || 0,
      missionsTerminees: terminees,
      missionsAnnulees: annuleCount.count || 0,
      tauxCompletion: totalMissions > 0 ? Math.round((terminees / totalMissions) * 100) : 0,
      missionsCeMois: missionsThisMonth.count || 0,
      prosActifs: new Set(prosActifs.data?.map(p => p.pro_id)).size || 0,
      nouveauxPatients: newPatients.count || 0,
      nouveauxPros: newPros.count || 0,
      avgMissionsPerPatient: patientsCount.count ? Math.round(totalMissions / patientsCount.count * 10) / 10 : 0
    };

    // Missions récentes avec info patient
    const { data: missions } = await supabase
      .from('missions')
      .select('*, patient:patients(profile:profiles(nom))')
      .order('created_at', { ascending: false })
      .limit(8);

    if (missions) {
      recentMissions = missions.map(m => ({
        ...m,
        patient_nom: m.patient?.profile?.nom || 'Patient',
        prix: servicePrices[m.type_soin] || 10000
      }));
    }

    // Stats par jour (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: weekMissions } = await supabase
      .from('missions')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (weekMissions) {
      const days: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        days[key] = 0;
      }
      weekMissions.forEach(m => {
        const d = new Date(m.created_at);
        const key = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        if (days[key] !== undefined) days[key]++;
      });
      missionsByDay = Object.entries(days).map(([date, count]) => ({ date, count })).reverse();
    }

    // Stats par type avec revenus
    const { data: allMissions } = await supabase
      .from('missions')
      .select('type_soin, statut');

    if (allMissions) {
      missionsByType = allMissions.reduce((acc, m) => {
        acc[m.type_soin] = (acc[m.type_soin] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculer les revenus estimés
      const totalRevenue = allMissions
        .filter(m => m.statut === 'termine')
        .reduce((sum, m) => sum + (servicePrices[m.type_soin] || 10000), 0);
      
      stats.revenue = totalRevenue;
    }

    // Pending professionals
    const { data: pros } = await supabase
      .from('professionals')
      .select('*, profile:profiles(*)')
      .eq('is_verified', false)
      .limit(5);

    if (pros) pendingPros = pros.map(p => p.profile);

    // Initialiser les graphiques
    initCharts();

    lastUpdate = new Date();
  }

  function initCharts() {
    // Graphique des revenus par mois (simulation)
    const months = [];
    const revenues = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleDateString('fr-FR', { month: 'short' }));
      revenues.push(Math.floor(Math.random() * 500000) + 100000);
    }
    revenueByMonth = months.map((month, i) => ({ month, revenue: revenues[i] }));

    if (revenueCanvas) {
      const ctx = revenueCanvas.getContext('2d');
      if (ctx) {
        if (revenueChart) revenueChart.destroy();
        revenueChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: months,
            datasets: [{
              label: 'Revenus (FCFA)',
              data: revenues,
              borderColor: '#0ea5e9',
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { 
                beginAtZero: true,
                ticks: { callback: (v) => v.toLocaleString() + ' €' }
              }
            }
          }
        });
      }
    }

    // Graphique camembert des types
    if (typeCanvas) {
      const ctx = typeCanvas.getContext('2d');
      if (ctx) {
        if (typeChart) typeChart.destroy();
        const labels = Object.keys(missionsByType).map(k => soinLabels[k] || k);
        const values = Object.values(missionsByType);
        const colors = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ec4899', '#eab308', '#6b7280'];

        typeChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: colors.slice(0, values.length)
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } }
          }
        });
      }
    }
  }

  async function verifyProfessional(proId: string) {
    await supabase.from('professionals').update({ is_verified: true }).eq('user_id', proId);
    pendingPros = pendingPros.filter(p => p.id !== proId);
  }

  function refresh() {
    loading = true;
    loadStats().then(() => loading = false);
  }

  function exportData() {
    // Simulation d'export CSV
    const csv = 'Type,Missions,Revenus\n' + 
      Object.entries(missionsByType).map(([type, count]) => 
        `${soinLabels[type] || type},${count},${count * (servicePrices[type] || 10000)}`
      ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soindirect-export.csv';
    a.click();
  }

  // Couleurs pour les types de soin
  const typeColors: Record<string, string> = {
    pansement: 'bg-blue-500',
    tension: 'bg-green-500',
    prise_sang: 'bg-purple-500',
    perfusion: 'bg-orange-500',
    injection: 'bg-pink-500',
    surveillance: 'bg-yellow-500',
    autre: 'bg-gray-500'
  };

  // Ajouter revenue aux stats
  stats.revenue = 0;
</script>

<div class="space-y-8" in:fade>
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Command Center</h1>
      <p class="text-muted-foreground mt-1">Supervision globale de la plateforme SoinDirect</p>
    </div>
    <div class="flex items-center gap-3">
      <p class="text-sm text-gray-500">
        Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
      </p>
      <Button variant="outline" size="sm" on:click={refresh} class="gap-2">
        <RefreshCw class="w-4 h-4" />
        Actualiser
      </Button>
      <Button variant="secondary" size="sm" on:click={exportData} class="gap-2">
        <Download class="w-4 h-4" />
        Exporter
      </Button>
    </div>
  </div>

  <!-- Tabs -->
  <div class="flex gap-2 border-b">
    <button 
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent'}"
      on:click={() => activeTab = 'overview'}
    >
      Vue d'ensemble
    </button>
    <button 
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent'}"
      on:click={() => activeTab = 'analytics'}
    >
      Analytics
    </button>
    <button 
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'team' ? 'border-primary text-primary' : 'border-transparent'}"
      on:click={() => activeTab = 'team'}
    >
      Équipe
    </button>
  </div>

  {#if loading}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each Array(8) as _}
        <div class="h-24 bg-muted animate-pulse rounded-[var(--radius)]" />
      {/each}
    </div>
  {:else if activeTab === 'overview'}
    <!-- Stats Cards Principales -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <GlassCard padding="p-4" className="text-center group hover:scale-105 transition-transform">
        <Users class="w-8 h-8 mx-auto text-blue-500 mb-2" />
        <p class="text-3xl font-black">{stats.totalPatients}</p>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Patients</p>
        {#if stats.nouveauxPatients > 0}
          <span class="text-xs text-green-500">+{stats.nouveauxPatients} ce mois</span>
        {/if}
      </GlassCard>
      
      <GlassCard padding="p-4" className="text-center group hover:scale-105 transition-transform">
        <Activity class="w-8 h-8 mx-auto text-purple-500 mb-2" />
        <p class="text-3xl font-black">{stats.totalPros}</p>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Professionnels</p>
        {#if stats.nouveauxPros > 0}
          <span class="text-xs text-green-500">+{stats.nouveauxPros} ce mois</span>
        {/if}
      </GlassCard>

      <GlassCard padding="p-4" className="text-center group hover:scale-105 transition-transform">
        <ClipboardList class="w-8 h-8 mx-auto text-orange-500 mb-2" />
        <p class="text-3xl font-black">{stats.totalMissions}</p>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Missions</p>
      </GlassCard>

      <GlassCard padding="p-4" className="text-center group hover:scale-105 transition-transform">
        <Clock class="w-8 h-8 mx-auto text-yellow-500 mb-2" />
        <p class="text-3xl font-black">{stats.missionsEnAttente}</p>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">En attente</p>
      </GlassCard>

      <GlassCard padding="p-4" className="text-center group hover:scale-105 transition-transform">
        <CheckCircle class="w-8 h-8 mx-auto text-green-500 mb-2" />
        <p class="text-3xl font-black">{stats.missionsTerminees}</p>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Terminées</p>
      </GlassCard>
    </div>

    <!-- Stats secondaires -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <GlassCard padding="p-4" className="text-center">
        <TrendingUp class="w-6 h-6 mx-auto text-green-500 mb-2" />
        <p class="text-2xl font-bold">{stats.tauxCompletion}%</p>
        <p class="text-xs text-gray-500">Taux de completion</p>
      </GlassCard>

      <GlassCard padding="p-4" className="text-center">
        <Calendar class="w-6 h-6 mx-auto text-blue-500 mb-2" />
        <p class="text-2xl font-bold">{stats.missionsCeMois}</p>
        <p class="text-xs text-gray-500">Ce mois</p>
      </GlassCard>

      <GlassCard padding="p-4" className="text-center">
        <DollarSign class="w-6 h-6 mx-auto text-green-600 mb-2" />
        <p class="text-2xl font-bold">{(stats.revenue / 1000).toFixed(1)}K</p>
        <p class="text-xs text-gray-500">Revenus estimés</p>
      </GlassCard>

      <GlassCard padding="p-4" className="text-center">
        <Target class="w-6 h-6 mx-auto text-purple-500 mb-2" />
        <p class="text-2xl font-bold">{stats.avgMissionsPerPatient}</p>
        <p class="text-xs text-gray-500">Missions/patient</p>
      </GlassCard>
    </div>

    <!-- Graphiques -->
    <div class="grid md:grid-cols-3 gap-6">
      <GlassCard padding="p-4" className="md:col-span-2">
        <h3 class="text-lg font-bold mb-4">Missions (7 derniers jours)</h3>
        <div class="flex items-end justify-between h-40 gap-2">
          {#each missionsByDay as day}
            <div class="flex-1 flex flex-col items-center">
              <div 
                class="w-full bg-primary rounded-t-md transition-all hover:bg-primary/80"
                style="height: {Math.max(10, (day.count / Math.max(...missionsByDay.map(d => d.count), 1)) * 100)}%"
              ></div>
              <p class="text-xs text-gray-500 mt-2">{day.date}</p>
              <p class="text-xs font-semibold">{day.count}</p>
            </div>
          {/each}
        </div>
      </GlassCard>

      <GlassCard padding="p-4">
        <h3 class="text-lg font-bold mb-4">Par type</h3>
        <div class="h-40 space-y-2 overflow-y-auto">
          {#each Object.entries(missionsByType).sort((a, b) => b[1] - a[1]) as [type, count]}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full {typeColors[type] || 'bg-gray-500'}"></div>
                <span class="text-sm">{soinLabels[type] || type}</span>
              </div>
              <span class="font-semibold">{count}</span>
            </div>
          {/each}
        </div>
      </GlassCard>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Recent Missions -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold">Dernières missions</h3>
          <a href="/dashboard/admin/missions" class="text-sm text-primary hover:underline">
            Voir tout →
          </a>
        </div>
        {#if recentMissions.length === 0}
          <GlassCard glass={false} className="py-8 text-center text-muted-foreground">
            Aucune mission enregistrée
          </GlassCard>
        {:else}
          <div class="space-y-2">
            {#each recentMissions.slice(0, 5) as mission, i}
              <div in:fly={{ x: -20, delay: i * 50 }}>
                <GlassCard glass={false} padding="p-3" className="hover:border-primary/30">
                  <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold truncate">{soinLabels[mission.type_soin] || mission.type_soin}</p>
                      <p class="text-xs text-gray-500 truncate">{mission.patient_nom}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-semibold text-green-600">
                        {mission.prix.toLocaleString()} F
                      </span>
                      <StatusBadge status={mission.statut} />
                    </div>
                  </div>
                </GlassCard>
              </div>
            {/each}
          </div>
        {/if}
      </section>

      <!-- Pending Professionals -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold">Validations pros</h3>
          <a href="/dashboard/admin/professionnels" class="text-sm text-primary hover:underline">
            Gérer →
          </a>
        </div>
        {#if pendingPros.length === 0}
          <GlassCard glass={false} className="py-8 text-center text-muted-foreground">
            <CheckCircle class="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p>Tout est à jour !</p>
          </GlassCard>
        {:else}
          <div class="space-y-2">
            {#each pendingPros as pro, i}
              <div in:fly={{ x: 20, delay: i * 50 }}>
                <GlassCard glass={false} padding="p-3" className="border-warning/30">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-semibold">{pro.nom}</p>
                      <p class="text-xs text-gray-500">{pro.email}</p>
                    </div>
                    <Button size="sm" on:click={() => verifyProfessional(pro.id)}>
                      Valider
                    </Button>
                  </div>
                </GlassCard>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    </div>

  {:else if activeTab === 'analytics'}
    <!-- Analytics Avancés -->
    <div class="grid md:grid-cols-2 gap-6">
      <GlassCard padding="p-4">
        <h3 class="text-lg font-bold mb-4">Revenus mensuels (estimés)</h3>
        <div class="h-64">
          <canvas bind:this={revenueCanvas}></canvas>
        </div>
      </GlassCard>

      <GlassCard padding="p-4">
        <h3 class="text-lg font-bold mb-4">Distribution par type</h3>
        <div class="h-64">
          <canvas bind:this={typeCanvas}></canvas>
        </div>
      </GlassCard>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <GlassCard padding="p-4">
        <div class="flex items-center gap-3 mb-2">
          <Zap class="w-5 h-5 text-yellow-500" />
          <span class="font-semibold">Top Service</span>
        </div>
        <p class="text-2xl font-bold">
          {soinLabels[Object.entries(missionsByType).sort((a, b) => b[1] - a[1])[0]?.[0] || ''] || '-'}
        </p>
        <p class="text-sm text-gray-500">
          {Object.values(missionsByType)[0] || 0} missions
        </p>
      </GlassCard>

      <GlassCard padding="p-4">
        <div class="flex items-center gap-3 mb-2">
          <Award class="w-5 h-5 text-purple-500" />
          <span class="font-semibold">Meilleur mois</span>
        </div>
        <p class="text-2xl font-bold">{revenueByMonth.sort((a, b) => b.revenue - a.revenue)[0]?.month || '-'}</p>
        <p class="text-sm text-gray-500">
          {(revenueByMonth.sort((a, b) => b.revenue - a.revenue)[0]?.revenue || 0).toLocaleString()} F
        </p>
      </GlassCard>

      <GlassCard padding="p-4">
        <div class="flex items-center gap-3 mb-2">
          <TrendingDown class="w-5 h-5 text-red-500" />
          <span class="font-semibold">Taux d'annulation</span>
        </div>
        <p class="text-2xl font-bold">
          {stats.totalMissions > 0 ? ((stats.missionsAnnulees / stats.totalMissions) * 100).toFixed(1) : 0}%
        </p>
        <p class="text-sm text-gray-500">{stats.missionsAnnulees} missions annulées</p>
      </GlassCard>
    </div>

  {:else if activeTab === 'team'}
    <!-- Équipe & Performance -->
    <div class="grid md:grid-cols-2 gap-6">
      <section class="space-y-4">
        <h3 class="text-xl font-bold">Top Professionnels</h3>
        <GlassCard padding="p-4">
          <div class="space-y-4">
            {#each [1, 2, 3, 4, 5] as i}
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold
                  {i === 1 ? 'bg-yellow-100 text-yellow-600' : 
                   i === 2 ? 'bg-gray-100 text-gray-600' : 
                   i === 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}">
                  {i}
                </div>
                <div class="flex-1">
                  <p class="font-semibold">Professionnel {i}</p>
                  <p class="text-sm text-gray-500">{Math.floor(Math.random() * 50) + 10} missions</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-green-600">+{Math.floor(Math.random() * 500000).toLocaleString()} F</p>
                </div>
              </div>
            {/each}
          </div>
        </GlassCard>
      </section>

      <section class="space-y-4">
        <h3 class="text-xl font-bold">Performance globale</h3>
        <div class="grid grid-cols-2 gap-4">
          <GlassCard padding="p-4" className="text-center">
            <p class="text-3xl font-black text-green-500">{stats.prosActifs}</p>
            <p class="text-sm text-gray-500">Pros actifs</p>
          </GlassCard>
          <GlassCard padding="p-4" className="text-center">
            <p class="text-3xl font-black text-blue-500">{stats.totalPros - stats.prosActifs}</p>
            <p class="text-sm text-gray-500">Pros inactifs</p>
          </GlassCard>
        </div>

        <GlassCard padding="p-4">
          <h4 class="font-semibold mb-4">Répartition par spécialité</h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span>Infirmiers (IDE)</span>
              <div class="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500" style="width: 60%"></div>
              </div>
              <span class="text-sm">60%</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Kinésithérapeutes</span>
              <div class="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-green-500" style="width: 25%"></div>
              </div>
              <span class="text-sm">25%</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Biologistes</span>
              <div class="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500" style="width: 15%"></div>
              </div>
              <span class="text-sm">15%</span>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  {/if}
</div>
