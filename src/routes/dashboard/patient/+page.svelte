<script lang="ts">
  import { supabase, type Mission } from '$lib/supabase/client';
  import { onMount } from 'svelte';
  import { 
    PlusCircle, ArrowRight, Activity, Heart, Clock, 
    CheckCircle, Stethoscope, TrendingUp
  } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import Button from '$lib/components/ui/Button.svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import HealthChart from '$lib/components/ui/HealthChart.svelte';

  export let data;
  export let params = {};

  let missions: Mission[] = [];
  let healthRecords: any[] = [];
  let loading = true;
  let userName = '';

  const soinLabels: Record<string, string> = {
    pansement: 'Pansement',
    tension: 'Mesure tension',
    prise_sang: 'Prise de sang',
    perfusion: 'Perfusion',
    injection: 'Injection',
    surveillance: 'Surveillance',
    autre: 'Autre'
  };

  const soinIcons: Record<string, string> = {
    pansement: '🩹',
    tension: '💓',
    prise_sang: '🩸',
    perfusion: '💉',
    injection: '💊',
    surveillance: '👨‍⚕️',
    autre: '🏥'
  };

  onMount(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('nom')
      .eq('id', userData.user.id)
      .single();
    
    userName = profile?.nom || 'Patient';

    const [missionsRes, recordsRes] = await Promise.all([
      supabase.from('missions').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('clinical_records')
        .select('*, missions!inner(*)')
        .eq('missions.patient_id', (await supabase.from('patients').select('id').eq('user_id', userData.user.id).single()).data?.id)
        .order('created_at', { ascending: true })
        .limit(10)
    ]);

    if (missionsRes.data) missions = missionsRes.data;
    if (recordsRes.data) healthRecords = recordsRes.data;
    loading = false;
  });

  $: chartData = healthRecords.map(r => ({
    label: new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    value: r.tension_sys || 0
  }));

  $: stats = {
    total: missions.length,
    enAttente: missions.filter(m => m.statut === 'en_attente').length,
    enCours: missions.filter(m => m.statut === 'accepte').length,
    terminees: missions.filter(m => m.statut === 'termine').length
  };

  const services = [
    { id: 'pansement', label: 'Pansement', icon: '🩹', desc: 'Soins de plaies', color: 'bg-blue-500' },
    { id: 'tension', label: 'Tension', icon: '💓', desc: 'Mesure cardiaque', color: 'bg-red-500' },
    { id: 'prise_sang', label: 'Prise de sang', icon: '🩸', desc: 'Analyses', color: 'bg-purple-500' },
    { id: 'injection', label: 'Injection', icon: '💉', desc: 'Médicaments', color: 'bg-orange-500' },
    { id: 'perfusion', label: 'Perfusion', icon: '💧', desc: 'Intraveineuse', color: 'bg-cyan-500' },
    { id: 'surveillance', label: 'Surveillance', icon: '👨‍⚕️', desc: 'Suivi médical', color: 'bg-green-500' }
  ];
</script>

<div class="max-w-6xl mx-auto space-y-8" in:fade>
  <!-- Hero Section -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white p-8 md:p-12">
    <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
    <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
    
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <p class="text-white/80 mb-2">Bonjour,</p>
        <h1 class="text-3xl md:text-4xl font-bold mb-2">{userName} 👋</h1>
        <p class="text-white/90 text-lg">Vos soins à domicile, simplifiés.</p>
      </div>
      <Button 
        href="/dashboard/patient/demander" 
        class="bg-white text-primary hover:bg-white/90 gap-2 px-8 py-4 text-lg"
      >
        <PlusCircle size={24} />
        Demander un soin
      </Button>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <GlassCard padding="p-4" className="text-center hover:scale-105 transition-transform">
      <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-2">
        <Clock class="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <p class="text-2xl font-black dark:text-white">{stats.enAttente}</p>
      <p class="text-xs text-gray-500 dark:text-gray-400">En attente</p>
    </GlassCard>
    
    <GlassCard padding="p-4" className="text-center hover:scale-105 transition-transform">
      <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center mx-auto mb-2">
        <Activity class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      </div>
      <p class="text-2xl font-black dark:text-white">{stats.enCours}</p>
      <p class="text-xs text-gray-500 dark:text-gray-400">En cours</p>
    </GlassCard>
    
    <GlassCard padding="p-4" className="text-center hover:scale-105 transition-transform">
      <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-2">
        <CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
      <p class="text-2xl font-black dark:text-white">{stats.terminees}</p>
      <p class="text-xs text-gray-500 dark:text-gray-400">Terminées</p>
    </GlassCard>
    
    <GlassCard padding="p-4" className="text-center hover:scale-105 transition-transform">
      <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-2">
        <TrendingUp class="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>
      <p class="text-2xl font-black dark:text-white">{stats.total}</p>
      <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
    </GlassCard>
  </div>

  <!-- Services Grid -->
  <section>
    <h2 class="text-xl font-bold mb-4 dark:text-white">Services disponibles</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {#each services as service}
        <a href="/dashboard/patient/demander" class="group">
          <GlassCard padding="p-6" className="text-center hover:border-primary/50 transition-all group-hover:-translate-y-2 hover:shadow-lg">
            <div class="text-6xl mb-3 transform group-hover:scale-110 transition-transform">{service.icon}</div>
            <p class="font-bold text-base dark:text-white">{service.label}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{service.desc}</p>
          </GlassCard>
        </a>
      {/each}
    </div>
  </section>

  <!-- Health Chart -->
  {#if healthRecords.length > 1}
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold dark:text-white">Évolution de votre santé</h2>
        <span class="text-sm text-gray-500 dark:text-gray-400">Derniers relevés</span>
      </div>
      <GlassCard padding="p-4">
        <HealthChart data={chartData} label="Tension Systolique (mmHg)" />
      </GlassCard>
    </section>
  {/if}

  <!-- Dernières demandes -->
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold dark:text-white">Mes dernières demandes</h2>
      <a href="/dashboard/patient/historique" class="text-sm font-medium text-primary hover:underline flex items-center gap-1">
        Voir tout
        <ArrowRight size={14} />
      </a>
    </div>

    {#if loading}
      <div class="grid gap-4">
        {#each Array(3) as _}
          <div class="h-24 bg-muted animate-pulse rounded-2xl" />
        {/each}
      </div>
    {:else if missions.length === 0}
      <GlassCard glass={false} className="py-16 text-center">
        <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart class="w-10 h-10 text-primary" />
        </div>
        <h3 class="text-xl font-bold mb-2 dark:text-white">Aucune demande</h3>
        <p class="text-gray-500 mb-6 dark:text-gray-400">Commencez par demander votre premier soin à domicile</p>
        <Button href="/dashboard/patient/demander" class="gap-2">
          <PlusCircle size={20} />
          Faire une demande
        </Button>
      </GlassCard>
    {:else}
      <div class="grid gap-3">
        {#each missions as mission, i}
          <div in:fly={{ y: 20, delay: i * 100 }}>
            <GlassCard glass={false} padding="p-4" className="hover:border-primary/30 transition-all">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-primary/5 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-2xl">
                  {soinIcons[mission.type_soin] || '🏥'}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="font-bold dark:text-white">{soinLabels[mission.type_soin] || mission.type_soin}</p>
                    <StatusBadge status={mission.statut} />
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(mission.date_prevue).toLocaleDateString('fr-FR', { 
                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <ArrowRight class="w-5 h-5 text-gray-300" />
              </div>
            </GlassCard>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Quick Actions -->
  <section class="grid md:grid-cols-2 gap-4">
    <a href="/dashboard/patient/demander">
      <GlassCard padding="p-6" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Stethoscope class="w-6 h-6" />
          </div>
          <div>
            <p class="font-bold text-lg">Demander un soin</p>
            <p class="text-white/80 text-sm">Prise en charge sous 24h</p>
          </div>
        </div>
      </GlassCard>
    </a>
    
    <a href="/dashboard/patient/historique">
      <GlassCard padding="p-6" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Activity class="w-6 h-6" />
          </div>
          <div>
            <p class="font-bold text-lg">Mon historique</p>
            <p class="text-white/80 text-sm">Voir tous mes soins</p>
          </div>
        </div>
      </GlassCard>
    </a>
  </section>
</div>
