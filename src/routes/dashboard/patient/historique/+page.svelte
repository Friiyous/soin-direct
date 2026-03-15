<script lang="ts">
  import { fade } from 'svelte/transition';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import { ArrowLeft, Clock, Calendar, CheckCircle, MessageCircle } from 'lucide-svelte';
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
        pro:profiles!missions_pro_id_fkey(nom, role)
      `)
      .eq('patient_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (missionsData) {
      missions = missionsData;
    }
    loading = false;
  });

  function openChat(mission: any) {
    if (mission.pro_id && mission.pro?.nom) {
      activeChat = {
        missionId: mission.id,
        receiverId: mission.pro_id,
        receiverName: mission.pro.nom
      };
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function isChatAvailable(mission: any) {
    return mission.pro_id && (mission.statut === 'accepte' || mission.statut === 'termine');
  }
</script>

<div class="max-w-4xl mx-auto space-y-8" in:fade>
  <header class="flex items-center justify-between">
    <div>
      <a href="/dashboard/patient" class="text-sm font-medium text-primary hover:underline flex items-center gap-1 mb-2">
        <ArrowLeft size={14} />
        Retour au tableau de bord
      </a>
      <h1 class="text-3xl font-bold tracking-tight">Historique des soins</h1>
      <p class="text-muted-foreground mt-1">Retrouvez toutes vos interventions passées.</p>
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
      <p class="text-gray-500">Aucun historique pour le moment</p>
    </GlassCard>
  {:else}
    <div class="grid gap-4">
      {#each missions as mission}
        <GlassCard glass={false} padding="p-4" className="hover:border-primary/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-2xl">
                {soinIcons[mission.type_soin] || '🏥'}
              </div>
              <div>
                <p class="font-bold text-lg">{mission.type_soin}</p>
                <div class="flex items-center gap-3 mt-1">
                  <p class="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(mission.date_prevue)}
                  </p>
                  {#if mission.pro?.nom}
                    <p class="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      {mission.pro.nom}
                    </p>
                  {/if}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 text-xs font-bold rounded-full uppercase
                {mission.statut === 'termine' ? 'bg-success/10 text-success' : 
                 mission.statut === 'accepte' ? 'bg-blue-100 text-blue-600' : 
                 'bg-yellow-100 text-yellow-600'}">
                {mission.statut === 'termine' ? 'Terminé' : 
                 mission.statut === 'accepte' ? 'En cours' : 
                 'En attente'}
              </span>
              {#if isChatAvailable(mission)}
                <button
                  on:click={() => openChat(mission)}
                  class="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  title="Envoyer un message"
                >
                  <MessageCircle size={18} />
                </button>
              {/if}
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
