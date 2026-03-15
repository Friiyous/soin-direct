<script lang="ts">
  export let data;
  export let params = {};
  import { supabase, type TypeSoin } from '$lib/supabase/client';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { Upload, MapPin, Loader2, ArrowLeft, Check, Stethoscope } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';

  const typesSoin: { value: TypeSoin; label: string; icon: string; desc: string; color: string }[] = [
    { value: 'pansement', label: 'Pansement', icon: '🩹', desc: 'Soins de plaies', color: 'bg-blue-500' },
    { value: 'tension', label: 'Tension', icon: '💓', desc: 'Mesure cardiaque', color: 'bg-red-500' },
    { value: 'prise_sang', label: 'Prise de sang', icon: '🩸', desc: 'Analyses', color: 'bg-purple-500' },
    { value: 'perfusion', label: 'Perfusion', icon: '💧', desc: 'Intraveineuse', color: 'bg-cyan-500' },
    { value: 'injection', label: 'Injection', icon: '💉', desc: 'Médicaments', color: 'bg-orange-500' },
    { value: 'surveillance', label: 'Surveillance', icon: '👨‍⚕️', desc: 'Suivi médical', color: 'bg-green-500' },
    { value: 'autre', label: 'Autre', icon: '🏥', desc: 'Autre soin', color: 'bg-gray-500' }
  ];

  let typeSoin: TypeSoin = 'pansement';
  let description = '';
  let datePrevue = '';
  let ordonnaceFile: File | null = null;
  let uploading = false;
  let loading = false;
  let error = '';
  let gpsLoading = false;
  let gpsError = '';
  let gpsCoords = { lat: 0, lng: 0 };
  let step = 1;

  $: selectedType = typesSoin.find(t => t.value === typeSoin);

  // Obtenir la géolocalisation
  async function getLocation() {
    gpsLoading = true;
    gpsError = '';

    if (!navigator.geolocation) {
      gpsError = 'La géolocalisation n\'est pas supportée';
      gpsLoading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        gpsCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        gpsLoading = false;
      },
      (err) => {
        gpsError = 'Impossible d\'obtenir la position';
        gpsLoading = false;
      }
    );
  }

  async function handleSubmit() {
    loading = true;
    error = '';

    if (!$auth.user) {
      error = 'Vous devez être connecté';
      loading = false;
      return;
    }

    // Upload ordonnance si présente
    let ordonnanceUrl = null;
    if (ordonnaceFile) {
      uploading = true;
      const fileName = `${$auth.user.id}/${Date.now()}_${ordonnaceFile.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('ordonnances')
        .upload(fileName, ordonnaceFile);

      if (uploadError) {
        error = 'Erreur lors de l\'upload';
        uploading = false;
        loading = false;
        return;
      }

      const { data: urlData } = supabase.storage
        .from('ordonnances')
        .getPublicUrl(fileName);

      ordonnanceUrl = urlData.publicUrl;
      uploading = false;
    }

    // Créer la mission
    const { data: patientData } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', $auth.user.id)
      .single();

    if (!patientData) {
      error = 'Profil patient non trouvé';
      loading = false;
      return;
    }

    const { error: missionError } = await supabase.from('missions').insert({
      patient_id: patientData.id,
      type_soin: typeSoin,
      description,
      date_prevue: new Date(datePrevue).toISOString(),
      gps_lat: gpsCoords.lat || null,
      gps_lng: gpsCoords.lng || null,
      ordonnance_url: ordonnanceUrl
    });

    if (missionError) {
      error = missionError.message;
    } else {
      goto('/dashboard/patient');
    }

    loading = false;
  }

  function nextStep() {
    if (step < 3) step++;
  }

  function prevStep() {
    if (step > 1) step--;
  }
</script>

<div class="max-w-3xl mx-auto" in:fade>
  <!-- Header -->
  <div class="mb-8">
    <a href="/dashboard/patient" class="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-4">
      <ArrowLeft class="w-4 h-4" />
      Retour
    </a>
    <h1 class="text-2xl md:text-3xl font-bold">Demander un soin</h1>
    <p class="text-gray-500 mt-1">Un professionnel qualifié chez vous sous 24h</p>
  </div>

  <!-- Progress Steps -->
  <div class="flex items-center justify-center gap-2 mb-8">
    {#each [1, 2, 3] as s}
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                    {step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}">
          {#if step > s}
            <Check class="w-5 h-5" />
          {:else}
            {s}
          {/if}
        </div>
        {#if s < 3}
          <div class="w-12 h-1 {step > s ? 'bg-primary' : 'bg-gray-200'}"></div>
        {/if}
      </div>
    {/each}
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    {#if error}
      <div class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        {error}
      </div>
    {/if}

    <!-- Step 1: Type de soin -->
    {#if step === 1}
      <div in:fly={{ x: 20 }}>
        <h2 class="text-lg font-semibold mb-4">Quel soin avez-vous besoin ?</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          {#each typesSoin as type}
            <button
              type="button"
              on:click={() => typeSoin = type.value}
              class="p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md
                     {typeSoin === type.value 
                       ? 'border-primary bg-primary/5' 
                       : 'border-gray-200 hover:border-primary/50'}"
            >
              <div class="text-3xl mb-2">{type.icon}</div>
              <p class="font-semibold">{type.label}</p>
              <p class="text-xs text-gray-500">{type.desc}</p>
            </button>
          {/each}
        </div>
        <div class="flex justify-end mt-6">
          <button type="button" on:click={nextStep} class="btn-primary">
            Continuer
          </button>
        </div>
      </div>
    {/if}

    <!-- Step 2: Détails -->
    {#if step === 2}
      <div in:fly={{ x: 20 }}>
        <h2 class="text-lg font-semibold mb-4">Précisez votre demande</h2>
        
        <div class="space-y-4">
          <!-- Date prévue -->
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
              📅 Date souhaitée *
            </label>
            <input
              type="datetime-local"
              id="date"
              bind:value={datePrevue}
              class="input-field"
              required
            />
          </div>

          <!-- Géolocalisation -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              📍 Position *
            </label>
            <button
              type="button"
              on:click={getLocation}
              disabled={gpsLoading}
              class="w-full p-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all
                     {gpsCoords.lat ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary'}"
            >
              {#if gpsLoading}
                <Loader2 class="w-5 h-5 animate-spin" />
                Localisation en cours...
              {:else if gpsCoords.lat}
                <MapPin class="w-5 h-5 text-green-600" />
                <span class="text-green-700">Position enregistrée</span>
              {:else}
                <MapPin class="w-5 h-5 text-gray-400" />
                <span>Cliquer pour obtenir ma position</span>
              {/if}
            </button>
            {#if gpsError}
              <p class="text-sm text-red-500 mt-1">{gpsError}</p>
            {/if}
          </div>

          <!-- Description -->
          <div>
            <label for="desc" class="block text-sm font-medium text-gray-700 mb-2">
              📝 Description (optionnel)
            </label>
            <textarea
              id="desc"
              bind:value={description}
              rows="3"
              class="input-field"
              placeholder="Décrivez votre besoin, symptômes, etc..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-between mt-6">
          <button type="button" on:click={prevStep} class="btn-secondary">
            Retour
          </button>
          <button type="button" on:click={nextStep} class="btn-primary" disabled={!gpsCoords.lat || !datePrevue}>
            Continuer
          </button>
        </div>
      </div>
    {/if}

    <!-- Step 3: Validation -->
    {#if step === 3}
      <div in:fly={{ x: 20 }}>
        <h2 class="text-lg font-semibold mb-4">Vérifiez votre demande</h2>

        <GlassCard padding="p-6" className="mb-6">
          <div class="flex items-start gap-4">
            <div class="text-5xl">{selectedType?.icon}</div>
            <div>
              <p class="text-2xl font-bold">{selectedType?.label}</p>
              <p class="text-gray-500">{selectedType?.desc}</p>
            </div>
          </div>
          
          <hr class="my-4" />
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-500">📅 Date</span>
              <span class="font-medium">{datePrevue ? new Date(datePrevue).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">📍 Position</span>
              <span class="font-medium text-green-600">Confirmée</span>
            </div>
            {#if description}
              <div>
                <span class="text-gray-500">📝 Description</span>
                <p class="mt-1 text-gray-700">{description}</p>
              </div>
            {/if}
          </div>
        </GlassCard>

        <!-- Upload ordonnance -->
        <div class="mb-6">
          <label for="ordonnance" class="block text-sm font-medium text-gray-700 mb-2">
            🏥 Ordonnance (optionnel)
          </label>
          <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="ordonnance"
              accept="image/*,.pdf"
              on:change={(e) => ordonnaceFile = e.currentTarget.files?.[0] || null}
              class="hidden"
            />
            <label for="ordonnance" class="cursor-pointer">
              {#if ordonnaceFile}
                <Check class="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p class="text-primary font-medium">{ordonnaceFile.name}</p>
                <p class="text-sm text-gray-500">Cliquez pour changer</p>
              {:else}
                <Upload class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500">Ajoutez une ordonnance si disponible</p>
              {/if}
            </label>
          </div>
        </div>

        <div class="flex justify-between">
          <button type="button" on:click={prevStep} class="btn-secondary">
            Retour
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            class="btn-primary gap-2"
          >
            {#if loading || uploading}
              <Loader2 class="w-5 h-5 animate-spin" />
              Envoi...
            {:else}
              <Stethoscope class="w-5 h-5" />
              Confirmer ma demande
            {/if}
          </button>
        </div>
      </div>
    {/if}
  </form>
</div>
