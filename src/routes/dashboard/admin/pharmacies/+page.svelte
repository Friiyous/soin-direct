<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, Pencil, Trash2, Search, MapPin, Phone, Clock, Star, Calendar, RefreshCw, AlertCircle } from 'lucide-svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  interface Pharmacy {
    id: string;
    name: string;
    address: string;
    phone: string;
    hours: string;
    rating: number;
    latitude: number;
    longitude: number;
    services: string[];
    is_24h: boolean;
    is_de_garde: boolean;
    garde_start_date?: string;
    garde_end_date?: string;
  }

  // Cycle de garde : 2 semaines
  const GARDE_DURATION_DAYS = 14;

  let pharmacies: Pharmacy[] = [
    {
      id: '1',
      name: 'Pharmacie du PORO',
      address: 'Boulevard principale, Korhogo',
      phone: '+225 07 00 11 22 33',
      hours: '07h00 - 21h00',
      rating: 4.8,
      latitude: 9.4500,
      longitude: -5.6167,
      services: ['Délivrance médicaments', 'Conseil pharmaceutique', 'Mesure tension'],
      is_24h: false,
      is_de_garde: true,
      garde_start_date: '2026-03-01',
      garde_end_date: '2026-03-14'
    },
    {
      id: '2',
      name: 'Pharmacie Saint-Jean',
      address: 'Rue du Marché, Korhogo',
      phone: '+225 07 00 44 55 66',
      hours: '07h00 - 22h00',
      rating: 4.6,
      latitude: 9.4520,
      longitude: -5.6150,
      services: ['Délivrance médicaments', 'Vaccination', 'Tests rapides'],
      is_24h: false,
      is_de_garde: true,
      garde_start_date: '2026-03-15',
      garde_end_date: '2026-03-28'
    },
    {
      id: '3',
      name: 'Pharmacie la Main Verte',
      address: 'Quartier Belleville, Korhogo',
      phone: '+225 07 00 77 88 99',
      hours: '24h/24',
      rating: 4.9,
      latitude: 9.4550,
      longitude: -5.6180,
      services: ['Urgences', 'Délivrance médicaments', 'Conseil pharmaceutique', 'Livraison à domicile'],
      is_24h: true,
      is_de_garde: false
    },
    {
      id: '4',
      name: 'Pharmacie du Centre',
      address: 'Centre-ville, Korhogo',
      phone: '+225 07 00 12 34 56',
      hours: '07h00 - 20h00',
      rating: 4.5,
      latitude: 9.4510,
      longitude: -5.6170,
      services: ['Délivrance médicaments', 'Orthopédie'],
      is_24h: false,
      is_de_garde: false
    },
    {
      id: '5',
      name: 'Pharmacie de la Gare',
      address: 'Quartier Gare, Korhogo',
      phone: '+225 07 00 98 76 54',
      hours: '06h00 - 21h00',
      rating: 4.4,
      latitude: 9.4480,
      longitude: -5.6140,
      services: ['Délivrance médicaments', 'Parapharmacie', 'Produits vétérinaires'],
      is_24h: false,
      is_de_garde: false
    }
  ];

  let searchQuery = '';
  let showModal = false;
  let editingPharmacy: Pharmacy | null = null;

  // Form fields
  let formData = {
    name: '',
    address: '',
    phone: '',
    hours: '',
    latitude: 9.45,
    longitude: -5.61,
    services: '',
    is_24h: false,
    is_de_garde: false
  };

  $: filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: pharmaciesDeGarde = pharmacies.filter(p => p.is_de_garde);

  function getGardeStatus(pharmacy: Pharmacy): string {
    if (!pharmacy.is_de_garde) return 'inactive';
    
    const now = new Date();
    const start = pharmacy.garde_start_date ? new Date(pharmacy.garde_start_date) : null;
    const end = pharmacy.garde_end_date ? new Date(pharmacy.garde_end_date) : null;
    
    if (!start || !end) return 'active';
    
    if (now >= start && now <= end) return 'active';
    return 'inactive';
  }

  function getDaysRemaining(pharmacy: Pharmacy): number {
    if (!pharmacy.garde_end_date) return 0;
    const now = new Date();
    const end = new Date(pharmacy.garde_end_date);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function calculateNextGarde(pharmacy: Pharmacy): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + GARDE_DURATION_DAYS);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  function activateGarde(pharmacy: Pharmacy) {
    const dates = calculateNextGarde(pharmacy);
    pharmacies = pharmacies.map(p => 
      p.id === pharmacy.id 
        ? { 
            ...p, 
            is_de_garde: true,
            garde_start_date: dates.start,
            garde_end_date: dates.end
          } 
        : p
    );
  }

  function rotateGarde() {
    // Trouver la pharmacie actuelle en garde
    const currentGarde = pharmaciesDeGarde.find(p => getGardeStatus(p) === 'active');
    if (!currentGarde) return;

    // Désactiver la garde actuelle
    pharmacies = pharmacies.map(p => 
      p.id === currentGarde.id 
        ? { ...p, is_de_garde: false, garde_start_date: '', garde_end_date: '' }
        : p
    );

    // Trouver la prochaine pharmacie dans la liste
    const currentIndex = pharmacies.findIndex(p => p.id === currentGarde.id);
    const nextIndex = (currentIndex + 1) % pharmacies.length;
    const nextPharmacy = pharmacies[nextIndex];

    // Activer la garde pour la suivante
    activateGarde(nextPharmacy);
  }

  function openAddModal() {
    editingPharmacy = null;
    formData = {
      name: '',
      address: '',
      phone: '',
      hours: '',
      latitude: 9.45,
      longitude: -5.61,
      services: '',
      is_24h: false,
      is_de_garde: false
    };
    showModal = true;
  }

  function openEditModal(pharmacy: Pharmacy) {
    editingPharmacy = pharmacy;
    formData = {
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      hours: pharmacy.hours,
      latitude: pharmacy.latitude,
      longitude: pharmacy.longitude,
      services: pharmacy.services.join(', '),
      is_24h: pharmacy.is_24h,
      is_de_garde: pharmacy.is_de_garde
    };
    showModal = true;
  }

  function savePharmacy() {
    const services = formData.services.split(',').map(s => s.trim()).filter(s => s);
    
    if (editingPharmacy) {
      // Update existing
      pharmacies = pharmacies.map(p => 
        p.id === editingPharmacy!.id 
          ? { ...p, ...formData, services }
          : p
      );
    } else {
      // Add new
      const newPharmacy: Pharmacy = {
        id: crypto.randomUUID(),
        ...formData,
        services,
        rating: 0
      };
      pharmacies = [...pharmacies, newPharmacy];
    }
    
    showModal = false;
  }

  function deletePharmacy(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette pharmacy ?')) {
      pharmacies = pharmacies.filter(p => p.id !== id);
    }
  }

  function toggleGarde(pharmacy: Pharmacy) {
    pharmacies = pharmacies.map(p => 
      p.id === pharmacy.id ? { ...p, is_de_garde: !p.is_de_garde } : p
    );
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold dark:text-white">Gestion des Pharmacies</h1>
      <p class="text-gray-500">Gérez les pharmacies du PORO</p>
    </div>
    <Button on:click={openAddModal} className="gap-2">
      <Plus class="w-4 h-4" />
      Ajouter une pharmacie
    </Button>
  </div>

  <!-- Cycle de garde actuel -->
  <GlassCard padding="p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2 dark:text-white">
        <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        Cycle de garde en cours
      </h2>
      <Button on:click={rotateGarde} variant="secondary" className="gap-2 text-sm">
        <RefreshCw class="w-4 h-4" />
        Passer au suivant
      </Button>
    </div>
    <p class="text-sm text-gray-500 mb-4">
      <Calendar class="w-4 h-4 inline mr-1" />
      Cycle de 2 semaines - Chaque pharmacie fait la garde à tour de rôle
    </p>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each pharmaciesDeGarde as pharmacy}
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold dark:text-white">{pharmacy.name}</h3>
              <p class="text-sm text-gray-500">{pharmacy.address}</p>
            </div>
            <span class="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              Garde
            </span>
          </div>
          {#if pharmacy.garde_start_date && pharmacy.garde_end_date}
            <div class="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
              <p class="text-xs text-green-700 dark:text-green-400">
                📅 {new Date(pharmacy.garde_start_date).toLocaleDateString('fr-FR')} - {new Date(pharmacy.garde_end_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </GlassCard>

  <!-- Search -->
  <div class="relative">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder="Rechercher une pharmacie..."
      bind:value={searchQuery}
      class="w-full pl-10 pr-4 py-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
    />
  </div>

  <!-- Pharmacies List -->
  <div class="space-y-4">
    {#each filteredPharmacies as pharmacy}
      <GlassCard padding="p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold dark:text-white">{pharmacy.name}</h3>
              {#if pharmacy.is_24h}
                <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  24h/24
                </span>
              {/if}
              {#if pharmacy.is_de_garde}
                <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  Garde
                </span>
              {/if}
            </div>
            
            <div class="space-y-1 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4" />
                <span>{pharmacy.address}</span>
              </div>
              <div class="flex items-center gap-2">
                <Phone class="w-4 h-4" />
                <span>{pharmacy.phone}</span>
              </div>
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4" />
                <span>{pharmacy.hours}</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mt-3">
              {#each pharmacy.services as service}
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-lg dark:text-gray-300">
                  {service}
                </span>
              {/each}
            </div>
          </div>

          <div class="flex flex-col items-end gap-2">
            <div class="flex items-center gap-1">
              <Star class="w-4 h-4 text-yellow-500 fill-current" />
              <span class="font-medium dark:text-white">{pharmacy.rating}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                on:click={() => toggleGarde(pharmacy)}
                class="p-2 rounded-lg {pharmacy.is_de_garde ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}"
                title={pharmacy.is_de_garde ? 'Retirer de garde' : 'Mettre en garde'}
              >
                <span class="text-xs font-medium">
                  {pharmacy.is_de_garde ? 'Garde' : 'Garde'}
                </span>
              </button>
              
              <button 
                on:click={() => openEditModal(pharmacy)}
                class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Pencil class="w-4 h-4" />
              </button>
              
              <button 
                on:click={() => deletePharmacy(pharmacy.id)}
                class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    {/each}
  </div>
</div>

<!-- Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4 dark:text-white">
        {editingPharmacy ? 'Modifier la pharmacie' : 'Ajouter une pharmacie'}
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nom</label>
          <input
            type="text"
            bind:value={formData.name}
            class="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">Adresse</label>
          <input
            type="text"
            bind:value={formData.address}
            class="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Téléphone</label>
            <input
              type="text"
              bind:value={formData.phone}
              class="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Horaires</label>
            <input
              type="text"
              bind:value={formData.hours}
              placeholder="07h00 - 21h00"
              class="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">Services (séparés par virgule)</label>
          <input
            type="text"
            bind:value={formData.services}
            placeholder="Délivrance médicaments, Vaccination..."
            class="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div class="flex gap-4">
          <label class="flex items-center gap-2 dark:text-gray-300">
            <input type="checkbox" bind:checked={formData.is_24h} class="w-4 h-4" />
            24h/24
          </label>
          <label class="flex items-center gap-2 dark:text-gray-300">
            <input type="checkbox" bind:checked={formData.is_de_garde} class="w-4 h-4" />
            Pharmacie de garde
          </label>
        </div>
      </div>
      
      <div class="flex gap-3 mt-6">
        <Button variant="secondary" on:click={() => showModal = false} className="flex-1">
          Annuler
        </Button>
        <Button on:click={savePharmacy} className="flex-1">
          Enregistrer
        </Button>
      </div>
    </div>
  </div>
{/if}
