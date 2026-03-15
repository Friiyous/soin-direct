<script lang="ts">
  import { onMount } from 'svelte';
  import { User, Calendar, Heart, Activity, FileText, Pill, Camera, Upload, AlertCircle } from 'lucide-svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  interface MedicalInfo {
    bloodType: string;
    allergies: string[];
    chronicDiseases: string[];
    currentMedications: string[];
    emergencyContact: {
      name: string;
      phone: string;
      relation: string;
    };
  }

  interface WoundPhoto {
    id: string;
    date: string;
    description: string;
    imageUrl: string;
  }

  let medicalInfo: MedicalInfo = {
    bloodType: 'O+',
    allergies: ['Pénicilline', 'Arachides'],
    chronicDiseases: ['Diabète type 2', 'Hypertension'],
    currentMedications: ['Metformine 850mg', 'Lisinopril 10mg'],
    emergencyContact: {
      name: 'Marie Kouadio',
      phone: '+225 07 00 00 00 00',
      relation: 'Épouse'
    }
  };

  let woundPhotos: WoundPhoto[] = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Plaie au niveau de la cheville gauche - Pansement effectué',
      imageUrl: ''
    },
    {
      id: '2',
      date: '2024-01-10',
      description: 'Suivi de la cicatrisation',
      imageUrl: ''
    }
  ];

  let newWoundDescription = '';
  let showUpload = false;

  function handlePhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const newPhoto: WoundPhoto = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: newWoundDescription || 'Nouvelle photo',
        imageUrl: URL.createObjectURL(input.files[0])
      };
      woundPhotos = [newPhoto, ...woundPhotos];
      newWoundDescription = '';
      showUpload = false;
    }
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <h1 class="text-2xl font-bold dark:text-white">Mon dossier médical</h1>

  <!-- Personal Info -->
  <GlassCard padding="p-6">
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
      <User class="w-5 h-5 text-primary" />
      Informations personnelles
    </h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <p class="text-sm text-gray-500">Nom complet</p>
        <p class="font-medium dark:text-white">Kouadio Jean-Baptiste</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Date de naissance</p>
        <p class="font-medium dark:text-white">15 Mars 1975 (49 ans)</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Groupe sanguin</p>
        <p class="font-medium dark:text-white">{medicalInfo.bloodType}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Taille / Poids</p>
        <p class="font-medium dark:text-white">175 cm / 82 kg</p>
      </div>
    </div>
  </GlassCard>

  <!-- Allergies -->
  <GlassCard padding="p-6">
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
      <AlertCircle class="w-5 h-5 text-red-500" />
      Allergies
    </h2>
    <div class="flex flex-wrap gap-2">
      {#each medicalInfo.allergies as allergy}
        <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          ⚠️ {allergy}
        </span>
      {/each}
    </div>
  </GlassCard>

  <!-- Chronic Diseases -->
  <GlassCard padding="p-6">
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
      <Heart class="w-5 h-5 text-pink-500" />
      Maladies chroniques
    </h2>
    <div class="space-y-2">
      {#each medicalInfo.chronicDiseases as disease}
        <div class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <Activity class="w-4 h-4 text-gray-400" />
          <span class="dark:text-white">{disease}</span>
        </div>
      {/each}
    </div>
  </GlassCard>

  <!-- Current Medications -->
  <GlassCard padding="p-6">
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
      <Pill class="w-5 h-5 text-purple-500" />
      Médicaments en cours
    </h2>
    <div class="space-y-2">
      {#each medicalInfo.currentMedications as med}
        <div class="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <Pill class="w-4 h-4 text-purple-500" />
          <span class="dark:text-white">{med}</span>
        </div>
      {/each}
    </div>
  </GlassCard>

  <!-- Emergency Contact -->
  <GlassCard padding="p-6">
    <h2 class="text-lg font-semibold mb-4 dark:text-white">Contact d'urgence</h2>
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <p class="text-sm text-gray-500">Nom</p>
        <p class="font-medium dark:text-white">{medicalInfo.emergencyContact.name}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Téléphone</p>
        <p class="font-medium dark:text-white">{medicalInfo.emergencyContact.phone}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Relation</p>
        <p class="font-medium dark:text-white">{medicalInfo.emergencyContact.relation}</p>
      </div>
    </div>
  </GlassCard>

  <!-- Wound Photos -->
  <GlassCard padding="p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2 dark:text-white">
        <Camera class="w-5 h-5 text-green-500" />
        Photos de plaies
      </h2>
      <Button on:click={() => showUpload = !showUpload} className="gap-2">
        <Upload class="w-4 h-4" />
        Ajouter une photo
      </Button>
    </div>

    {#if showUpload}
      <div class="mb-4 p-4 border-2 border-dashed rounded-xl">
        <input
          type="file"
          accept="image/*"
          on:change={handlePhotoUpload}
          class="w-full"
        />
        <input
          type="text"
          placeholder="Description de la photo..."
          bind:value={newWoundDescription}
          class="w-full mt-2 px-4 py-2 border rounded-xl"
        />
      </div>
    {/if}

    {#if woundPhotos.length === 0}
      <p class="text-gray-500 text-center py-8">Aucune photo de plaie</p>
    {:else}
      <div class="grid md:grid-cols-2 gap-4">
        {#each woundPhotos as photo}
          <div class="border rounded-xl overflow-hidden">
            <div class="aspect-video bg-gray-100 flex items-center justify-center">
              {#if photo.imageUrl}
                <img src={photo.imageUrl} alt={photo.description} class="w-full h-full object-cover" />
              {:else}
                <Camera class="w-12 h-12 text-gray-300" />
              {/if}
            </div>
            <div class="p-3">
              <p class="text-sm text-gray-500">{new Date(photo.date).toLocaleDateString('fr-FR')}</p>
              <p class="dark:text-white">{photo.description}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </GlassCard>
</div>
