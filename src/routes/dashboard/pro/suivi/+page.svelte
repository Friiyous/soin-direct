<script lang="ts">
  import { fade } from 'svelte/transition';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import { ArrowLeft, MapPin, Clock, Calendar, CheckCircle, MessageCircle } from 'lucide-svelte';
  import { supabase } from '$lib/supabase/client';
  import { onMount } from 'svelte';
  import Chat from '$lib/components/ui/Chat.svelte';

  export let data;
  export let params = {};

  let missions: any[] = [];
  let loading = true;
  let activeChat: { missionId: string; receiverId: string; receiverName: string } | null = null;

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

    const { data: missionsData } = await supabase
      .from('missions')
      .select(`
        *,
        patient:profiles!missions_patient_id_fkey(nom, telephone)
      `)
      .eq('pro_id', userData.user.id)
      .order('date_prevue', { ascending: true });

    if (missionsData) {
      missions = missionsData;
    }
    loading = false;
  });

  function openChat(mission: any) {
    if (mission.patient_id && mission.patient?.nom) {
      activeChat = {
        missionId: mission.id,
        receiverId: mission.patient_id,
        receiverName: mission.patient.nom
      };
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Demain, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function isChatAvailable(mission: any) {
    return mission.patient_id && (mission.statut === 'accepte' || mission.statut === 'termine');
  }
</script>

<div class="max-w-4xl mx-auto space-y-8" in:fade>
  <header class="flex items-center justify-between">
    <div>
      <a href="/dashboard/pro" class="text-sm font-medium text-primary hover:underline flex items-center gap-1 mb-2">
        <ArrowLeft size={14} />
        Retour aux missions
      </a>
      <h1 class="text-3xl font-bold tracking-tight">Mes Interventions</h1>
      <p class="text-muted-foreground mt-1">Gérez votre planning et vos patients.</p>
    </div>
  </header>

  {#if loading}
    <div class="space-y-4">
      {#each Array(3) as _}
        <div class="h-24 bg-muted animate-pulse rounded-2xl" />
      {/each}
    </div>
  {:else if missions.length === 0}
    <GlassCard glass={false} className="py-16 text-center">
      <p class="text-gray-500">Aucune intervention prévue</p>
    </GlassCard>
  {:else}
    <div class="grid gap-4">
      {#each missions as mission}
        <GlassCard glass={false} padding="p-6" className="hover:border-primary/30">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{soinIcons[mission.type_soin] || '🏥'}</span>
                <span class="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">
                  {mission.type_soin}
                </span>
                <p class="font-bold text-lg">{mission.patient?.nom || 'Patient'}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDate(mission.date_prevue)}
                </p>
                {#if mission.adresse}
                  <p class="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin size={14} />
                    {mission.adresse}
                  </p>
                {/if}
              </div>
            </div>
            <div class="flex items-center gap-2">
              {#if isChatAvailable(mission)}
                <button
                  on:click={() => openChat(mission)}
                  class="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  title="Envoyer un message"
                >
                  <MessageCircle size={20} />
                </button>
              {/if}
              <button class="btn-primary">
                {mission.statut === 'termine' ? 'Terminé' : 'Commencer le soin'}
              </button>
            </div>
          </div>
        </GlassCard>
      {/each}
    </div>
  {/if}
</div>

<!-- Chat Window -->
{#if activeChat}
  <Chat
    missionId={activeChat.missionId}
    receiverId={activeChat.receiverId}
    receiverName={activeChat.receiverName}
    onClose={() => activeChat = null}
  />
{/if}
