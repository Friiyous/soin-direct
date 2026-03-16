<script lang="ts">
  import { MapPin, Phone, Clock, Search, Navigation, Star, Calendar, AlertCircle } from 'lucide-svelte';
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

  let searchQuery = '';

  const pharmacies: Pharmacy[] = [
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

  $: pharmaciesDeGarde = pharmacies.filter(p => p.is_de_garde);
  
  $: filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function isGardeActive(pharmacy: Pharmacy): boolean {
    if (!pharmacy.is_de_garde || !pharmacy.garde_start_date || !pharmacy.garde_end_date) return false;
    
    const now = new Date();
    const start = new Date(pharmacy.garde_start_date);
    const end = new Date(pharmacy.garde_end_date);
    
    return now >= start && now <= end;
  }

  function getGardeInfo(pharmacy: Pharmacy): string {
    if (!pharmacy.garde_start_date || !pharmacy.garde_end_date) return '';
    return `${new Date(pharmacy.garde_start_date).toLocaleDateString('fr-FR')} - ${new Date(pharmacy.garde_end_date).toLocaleDateString('fr-FR')}`;
  }

  function openGoogleMaps(lat: number, lng: number) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }

  function callPharmacy(phone: string) {
    window.open(`tel:${phone}`, '_self');
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold dark:text-white">Pharmacies du PORO</h1>
    <span class="text-sm text-gray-500">{pharmacies.length} pharmacies</span>
  </div>

  <!-- Pharmacies de garde - Section Prioritaire -->
  <GlassCard padding="p-4" className="border-2 border-green-500">
    <div class="flex items-center gap-2 mb-4">
      <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
      <h2 class="text-lg font-bold dark:text-white">Pharmacie(s) de garde cette semaine</h2>
    </div>
    
    <div class="grid md:grid-cols-2 gap-4">
      {#each pharmaciesDeGarde.filter(p => isGardeActive(p)) as pharmacy}
        <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4">
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="font-bold text-green-800 dark:text-green-300">{pharmacy.name}</h3>
              <p class="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <MapPin class="w-3 h-3" />
                {pharmacy.address}
              </p>
            </div>
            <span class="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
              GARDE
            </span>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-green-700 dark:text-green-400 mb-3">
            <span class="flex items-center gap-1">
              <Phone class="w-4 h-4" />
              {pharmacy.phone}
            </span>
          </div>
          
          {#if pharmacy.garde_start_date && pharmacy.garde_end_date}
            <div class="text-xs text-green-600 dark:text-green-400 mb-3 flex items-center gap-1">
              <Calendar class="w-3 h-3" />
              Période: {getGardeInfo(pharmacy)}
            </div>
          {/if}
          
          <div class="flex gap-2">
            <button 
              on:click={() => callPharmacy(pharmacy.phone)}
              class="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Phone class="w-4 h-4" />
              Appeler
            </button>
            <button 
              on:click={() => openGoogleMaps(pharmacy.latitude, pharmacy.longitude)}
              class="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Navigation class="w-4 h-4" />
              Itinéraire
            </button>
          </div>
        </div>
      {/each}
      
      {#if pharmaciesDeGarde.filter(p => isGardeActive(p)).length === 0}
        <div class="col-span-2 text-center py-4 text-green-600 dark:text-green-400">
          <AlertCircle class="w-8 h-8 mx-auto mb-2" />
          <p>Aucune pharmacie de garde actuellement</p>
        </div>
      {/if}
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

  <!-- Toutes les Pharmacies -->
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
              {#if isGardeActive(pharmacy)}
                <span class="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                  GARDE
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

            <!-- Services -->
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
            <div class="flex gap-2">
              <button 
                on:click={() => callPharmacy(pharmacy.phone)}
                class="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Phone class="w-4 h-4" />
              </button>
              <button 
                on:click={() => openGoogleMaps(pharmacy.latitude, pharmacy.longitude)}
                class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Navigation class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    {/each}
  </div>

  {#if filteredPharmacies.length === 0}
    <GlassCard className="py-12 text-center">
      <p class="text-gray-500">Aucune pharmacie trouvée</p>
    </GlassCard>
  {/if}
</div>
