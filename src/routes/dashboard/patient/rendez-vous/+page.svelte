<script lang="ts">
  import { Calendar, Clock, User, MapPin, Video, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import GlassCard from '$lib/components/ui/GlassCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  interface Appointment {
    id: string;
    title: string;
    professional: string;
    specialty: string;
    date: string;
    time: string;
    type: 'home' | 'video';
    address?: string;
    status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  }

  let currentDate = new Date();
  let selectedDate: Date | null = null;

  const appointments: Appointment[] = [
    {
      id: '1',
      title: 'Pansement',
      professional: 'Marie Dubois',
      specialty: 'Infirmière',
      date: '2024-01-20',
      time: '14:00',
      type: 'home',
      address: 'Abidjan, Cocody',
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Suivi cardiaque',
      professional: 'Dr. Kouadio Amani',
      specialty: 'Cardiologue',
      date: '2024-01-22',
      time: '10:00',
      type: 'video',
      status: 'confirmed'
    },
    {
      id: '3',
      title: 'Prise de sang',
      professional: 'Jean Konan',
      specialty: 'Infirmier',
      date: '2024-01-25',
      time: '08:00',
      type: 'home',
      address: 'Abidjan, Marcory',
      status: 'pending'
    }
  ];

  $: monthDays = getMonthDays(currentDate);
  $: upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  function getMonthDays(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, date: '' });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasAppointment = appointments.some(a => a.date === dateStr);
      days.push({ day: i, isCurrentMonth: true, date: dateStr, hasAppointment });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, date: '' });
    }
    
    return days;
  }

  function prevMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  function nextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  }
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold dark:text-white">Mes rendez-vous</h1>

  <div class="grid lg:grid-cols-3 gap-6">
    <!-- Calendar -->
    <div class="lg:col-span-2">
      <GlassCard padding="p-4">
        <!-- Calendar Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold dark:text-white">
            {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
          <div class="flex gap-2">
            <button on:click={prevMonth} class="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft class="w-5 h-5" />
            </button>
            <button on:click={nextMonth} class="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Days of week -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          {#each ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as day}
            <div class="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
          {/each}
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-1">
          {#each monthDays as { day, isCurrentMonth, date, hasAppointment }}
            <button
              class="aspect-square p-2 rounded-lg text-center relative
                     {isCurrentMonth ? 'hover:bg-gray-100' : 'text-gray-300'}
                     {selectedDate?.toISOString().split('T')[0] === date ? 'bg-primary text-white' : ''}"
              disabled={!isCurrentMonth}
            >
              <span class="text-sm">{day}</span>
              {#if hasAppointment}
                <div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
              {/if}
            </button>
          {/each}
        </div>
      </GlassCard>
    </div>

    <!-- Upcoming Appointments -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold dark:text-white">À venir</h2>
      
      {#if upcomingAppointments.length === 0}
        <GlassCard className="py-8 text-center">
          <Calendar class="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p class="text-gray-500">Aucun rendez-vous</p>
        </GlassCard>
      {:else}
        {#each upcomingAppointments.slice(0, 5) as appointment}
          <GlassCard padding="p-4">
            <div class="flex items-start justify-between mb-2">
              <span class="px-2 py-1 text-xs rounded-full {getStatusColor(appointment.status)}">
                {getStatusLabel(appointment.status)}
              </span>
              {#if appointment.type === 'video'}
                <div class="flex items-center gap-1 text-green-600 text-xs">
                  <Video class="w-3 h-3" />
                  Vidéo
                </div>
              {/if}
            </div>
            
            <h3 class="font-semibold dark:text-white">{appointment.title}</h3>
            
            <div class="mt-2 space-y-1 text-sm text-gray-500">
              <div class="flex items-center gap-2">
                <User class="w-4 h-4" />
                {appointment.professional}
              </div>
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                {new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4" />
                {appointment.time}
              </div>
              {#if appointment.address}
                <div class="flex items-center gap-2">
                  <MapPin class="w-4 h-4" />
                  {appointment.address}
                </div>
              {/if}
            </div>
          </GlassCard>
        {/each}
      {/if}
    </div>
  </div>
</div>
