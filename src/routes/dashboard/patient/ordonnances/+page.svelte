<script lang="ts">
  import { FileText, Download, Calendar, User, Search, Pill } from 'lucide-svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  interface Prescription {
    id: string;
    doctor_name: string;
    doctor_specialty: string;
    date: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'used';
    medications: {
      name: string;
      dosage: string;
      duration: string;
      instructions: string;
    }[];
  }

  let prescriptions: Prescription[] = [
    {
      id: '1',
      doctor_name: 'Dr. Kouadio Amani',
      doctor_specialty: 'Cardiologue',
      date: '2024-01-15',
      expiry_date: '2024-07-15',
      status: 'active',
      medications: [
        { name: 'Lisinopril 10mg', dosage: '1 comprimé', duration: '3 mois', instructions: 'Le matin avant le petit-déjeuner' },
        { name: 'Aspirine 100mg', dosage: '1 comprimé', duration: '3 mois', instructions: 'Le soir pendant le repas' }
      ]
    },
    {
      id: '2',
      doctor_name: 'Dr. Marie Doumbia',
      doctor_specialty: 'Médecin généraliste',
      date: '2024-01-10',
      expiry_date: '2024-02-10',
      status: 'used',
      medications: [
        { name: 'Amoxicilline 500mg', dosage: '3 comprimés/jour', duration: '7 jours', instructions: 'Pendant les repas' }
      ]
    },
    {
      id: '3',
      doctor_name: 'Dr. Jean-Baptiste Konan',
      doctor_specialty: 'Diabétologue',
      date: '2023-12-01',
      expiry_date: '2024-01-01',
      status: 'expired',
      medications: [
        { name: 'Metformine 850mg', dosage: '2 comprimés/jour', duration: '1 mois', instructions: 'Après les repas' }
      ]
    }
  ];

  let searchQuery = '';
  let filterStatus = 'all';

  $: filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = p.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.medications.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'used': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'active': return 'Active';
      case 'expired': return 'Expirée';
      case 'used': return 'Utilisée';
      default: return status;
    }
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold dark:text-white">Mes ordonnances</h1>
  </div>

  <!-- Filters -->
  <div class="flex gap-4 flex-wrap">
    <div class="relative flex-1 min-w-[200px]">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Rechercher une ordonnance..."
        bind:value={searchQuery}
        class="w-full pl-10 pr-4 py-2 border rounded-xl"
      />
    </div>
    <select
      bind:value={filterStatus}
      class="px-4 py-2 border rounded-xl"
    >
      <option value="all">Tous les statuts</option>
      <option value="active">Actives</option>
      <option value="used">Utilisées</option>
      <option value="expired">Expirées</option>
    </select>
  </div>

  <!-- Prescriptions List -->
  {#if filteredPrescriptions.length === 0}
    <GlassCard className="py-16 text-center">
      <FileText class="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 class="text-xl font-bold mb-2 dark:text-white">Aucune ordonnance</h3>
      <p class="text-gray-500">Vous n'avez pas encore d'ordonnances</p>
    </GlassCard>
  {:else}
    <div class="space-y-4">
      {#each filteredPrescriptions as prescription}
        <GlassCard padding="p-6">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <User class="w-6 h-6 text-primary" />
              </div>
              <div>
                <p class="font-semibold dark:text-white">{prescription.doctor_name}</p>
                <p class="text-sm text-gray-500">{prescription.doctor_specialty}</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium {getStatusColor(prescription.status)}">
              {getStatusLabel(prescription.status)}
            </span>
          </div>

          <!-- Dates -->
          <div class="flex gap-6 mb-4 text-sm">
            <div class="flex items-center gap-2 text-gray-500">
              <Calendar class="w-4 h-4" />
              <span>Du {new Date(prescription.date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-500">
              <span>Au {new Date(prescription.expiry_date).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          <!-- Medications -->
          <div class="border-t pt-4">
            <p class="font-medium mb-3 dark:text-white flex items-center gap-2">
              <Pill class="w-4 h-4" />
              Médicaments prescrits
            </p>
            <div class="space-y-3">
              {#each prescription.medications as med}
                <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-medium dark:text-white">{med.name}</p>
                      <p class="text-sm text-gray-500">{med.dosage} - {med.duration}</p>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    📝 {med.instructions}
                  </p>
                </div>
              {/each}
            </div>
          </div>

          <!-- Actions -->
          {#if prescription.status === 'active'}
            <div class="flex gap-3 mt-4">
              <Button className="flex items-center gap-2">
                <Download class="w-4 h-4" />
                Télécharger PDF
              </Button>
            </div>
          {/if}
        </GlassCard>
      {/each}
    </div>
  {/if}
</div>
