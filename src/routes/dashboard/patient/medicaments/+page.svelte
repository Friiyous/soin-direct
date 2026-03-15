<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { 
    Pill, Plus, X, Check, Clock, AlertCircle, 
    Calendar, Trash2, Edit, Bell, ChevronDown
  } from 'lucide-svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { medications, todayMedications, loadTodayMedications, type Medication } from '$lib/stores/medications';

  let loading = true;
  let showAddForm = false;
  let editingMed: Medication | null = null;

  // Form fields
  let name = '';
  let dosage = '';
  let frequency = 'quotidien';
  let times: string[] = ['08:00'];
  let startDate = new Date().toISOString().split('T')[0];
  let endDate = '';
  let notes = '';

  const frequencies = [
    { value: 'quotidien', label: 'Quotidien' },
    { value: '2_jours', label: 'Tous les 2 jours' },
    { value: '3_jours', label: 'Tous les 3 jours' },
    { value: 'hebdomadaire', label: 'Hebdomadaire' },
    { value: 'autre', label: 'Autre' }
  ];

  onMount(async () => {
    await medications.load();
    await loadTodayMedications();
    loading = false;
  });

  function addTime() {
    times = [...times, '20:00'];
  }

  function removeTime(index: number) {
    times = times.filter((_, i) => i !== index);
  }

  async function handleSubmit() {
    if (!name || !dosage || !startDate) return;

    const medData = {
      name,
      dosage,
      frequency,
      times,
      start_date: startDate,
      end_date: endDate || null,
      notes: notes || null
    };

    if (editingMed) {
      await medications.update(editingMed.id, medData);
    } else {
      await medications.add(medData);
    }

    resetForm();
    await loadTodayMedications();
  }

  function resetForm() {
    name = '';
    dosage = '';
    frequency = 'quotidien';
    times = ['08:00'];
    startDate = new Date().toISOString().split('T')[0];
    endDate = '';
    notes = '';
    showAddForm = false;
    editingMed = null;
  }

  function editMed(med: Medication) {
    name = med.name;
    dosage = med.dosage;
    frequency = med.frequency;
    times = med.times;
    startDate = med.start_date;
    endDate = med.end_date || '';
    notes = med.notes || '';
    editingMed = med;
    showAddForm = true;
  }

  async function deleteMed(id: string) {
    if (confirm('Voulez-vous vraiment supprimer ce médicament ?')) {
      await medications.delete(id);
      await loadTodayMedications();
    }
  }

  async function markAsTaken(med: Medication, time: string) {
    await medications.logMedication(med.id, 'taken');
    await loadTodayMedications();
  }

  async function markAsSkipped(med: Medication, time: string) {
    await medications.logMedication(med.id, 'skipped');
    await loadTodayMedications();
  }

  function formatTime(time: string) {
    const [h, m] = time.split(':');
    return `${h}h${m}`;
  }

  function isTimePast(time: string): boolean {
    const now = new Date();
    const [h, m] = time.split(':');
    const medTime = new Date();
    medTime.setHours(parseInt(h), parseInt(m), 0);
    return now > medTime;
  }
</script>

<div class="max-w-4xl mx-auto space-y-8" in:fade>
  <header class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Mes Médicaments</h1>
      <p class="text-muted-foreground mt-1">Gérez vos traitements et rappels.</p>
    </div>
    <Button on:click={() => showAddForm = true} class="gap-2">
      <Plus size={18} />
      Ajouter un médicament
    </Button>
  </header>

  {#if loading}
    <div class="space-y-4">
      {#each Array(3) as _}
        <div class="h-24 bg-muted animate-pulse rounded-2xl" />
      {/each}
    </div>
  {:else}
    <!-- Today's Medications -->
    {#if $todayMedications.length > 0}
      <section>
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <Bell class="w-5 h-5 text-primary" />
          À prendre aujourd'hui
        </h2>
        <div class="grid gap-3">
          {#each $todayMedications as item, i}
            <div in:fly={{ y: 20, delay: i * 50 }}>
              <GlassCard glass={false} padding="p-4" 
                className="{item.status ? 'border-green-300 bg-green-50' : isTimePast(item.time) ? 'border-red-200 bg-red-50' : ''}">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center
                      {item.status?.status === 'taken' ? 'bg-green-100' : 
                       item.status?.status === 'skipped' ? 'bg-gray-100' : 
                       isTimePast(item.time) ? 'bg-red-100' : 'bg-primary/10'}">
                      {#if item.status?.status === 'taken'}
                        <Check class="w-6 h-6 text-green-600" />
                      {:else if item.status?.status === 'skipped'}
                        <X class="w-6 h-6 text-gray-400" />
                      {:else}
                        <Pill class="w-6 h-6 text-primary" />
                      {/if}
                    </div>
                    <div>
                      <p class="font-semibold">{item.medication.name}</p>
                      <p class="text-sm text-gray-500">{item.medication.dosage} - {formatTime(item.time)}</p>
                    </div>
                  </div>
                  {#if !item.status}
                    <div class="flex gap-2">
                      <Button size="sm" variant="outline" on:click={() => markAsSkipped(item.medication, item.time)}>
                        Ignorer
                      </Button>
                      <Button size="sm" on:click={() => markAsTaken(item.medication, item.time)}>
                        Pris
                      </Button>
                    </div>
                  {:else}
                    <span class="text-sm {item.status.status === 'taken' ? 'text-green-600' : 'text-gray-500'}">
                      {item.status.status === 'taken' ? 'Pris' : 'Ignoré'}
                    </span>
                  {/if}
                </div>
              </GlassCard>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- All Medications -->
    <section>
      <h2 class="text-xl font-bold mb-4">Tous mes médicaments</h2>
      {#if $medications.length === 0}
        <GlassCard glass={false} className="py-12 text-center">
          <Pill class="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p class="text-gray-500">Aucun medication enregistrée</p>
          <p class="text-sm text-gray-400">Ajoutez vos médicaments pour suivre votre traitement</p>
        </GlassCard>
      {:else}
        <div class="grid gap-3">
          {#each $medications as med, i}
            <div in:fly={{ y: 20, delay: i * 50 }}>
              <GlassCard glass={false} padding="p-4" className="hover:border-primary/30">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Pill class="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p class="font-semibold text-lg">{med.name}</p>
                      <p class="text-sm text-gray-500">{med.dosage}</p>
                      <div class="flex items-center gap-3 mt-1">
                        <span class="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {med.times.map(t => formatTime(t)).join(', ')}
                        </span>
                        <span class="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {med.frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button size="sm" variant="ghost" on:click={() => editMed(med)}>
                      <Edit size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" on:click={() => deleteMed(med.id)}>
                      <Trash2 size={16} class="text-red-500" />
                    </Button>
                  </div>
                </div>
                {#if med.notes}
                  <p class="text-sm text-gray-500 mt-2 ml-16">{med.notes}</p>
                {/if}
              </GlassCard>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</div>

<!-- Add/Edit Form Modal -->
{#if showAddForm}
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" on:click={resetForm} role="dialog">
    <div class="bg-white rounded-2xl p-6 w-full max-w-md" on:click|stopPropagation in:fly={{ y: 20 }}>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">{editingMed ? 'Modifier' : 'Ajouter'} un médicament</h2>
        <Button variant="ghost" size="sm" on:click={resetForm}>
          <X size={20} />
        </Button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nom du médicament *</label>
          <input 
            type="text" 
            bind:value={name}
            class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50"
            placeholder="Ex: Doliprane"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Dosage *</label>
          <input 
            type="text" 
            bind:value={dosage}
            class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50"
            placeholder="Ex: 1000mg, 1 comprimé"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Fréquence</label>
          <select 
            bind:value={frequency}
            class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50"
          >
            {#each frequencies as freq}
              <option value={freq.value}>{freq.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Heure(s) de prise</label>
          <div class="space-y-2">
            {#each times as time, i}
              <div class="flex gap-2">
                <input 
                  type="time" 
                  bind:value={times[i]}
                  class="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50"
                />
                {#if times.length > 1}
                  <Button type="button" variant="ghost" size="sm" on:click={() => removeTime(i)}>
                    <X size={16} />
                  </Button>
                {/if}
              </div>
            {/each}
            <Button type="button" variant="outline" size="sm" on:click={addTime} class="gap-1">
              <Plus size={14} />
              Ajouter une heure
            </Button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Date de début *</label>
            <input 
              type="date" 
              bind:value={startDate}
              class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Date de fin</label>
            <input 
              type="date" 
              bind:value={endDate}
              class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Notes</label>
          <textarea 
            bind:value={notes}
            class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50"
            rows="2"
            placeholder="Ex: À prendre pendant les repas"
          ></textarea>
        </div>

        <Button type="submit" class="w-full">
          {editingMed ? 'Enregistrer' : 'Ajouter le médicament'}
        </Button>
      </form>
    </div>
  </div>
{/if}
