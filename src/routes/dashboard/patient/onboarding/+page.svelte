<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Heart, ArrowRight, Check, User, Calendar, MessageSquare, Video, Shield } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let currentStep = 0;
  
  const steps = [
    {
      title: 'Bienvenue sur SoinDirect',
      description: 'Votre plateforme de soins à domicile en Côte d\'Ivoire',
      icon: Heart,
      color: 'bg-primary'
    },
    {
      title: 'Demandez un soin',
      description: 'Choisissez le type de soin dont vous avez besoin et recevez des propositions de professionnels qualifiés',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      title: 'Suivez vos rendez-vous',
      description: ' Consultez le statut de vos demandes et gérez vos rendez-vous en temps réel',
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Communicz facilement',
      description: 'Discutez avec votre professionnel de santé et faites des vidéoconsultations',
      icon: MessageSquare,
      color: 'bg-green-500'
    },
    {
      title: 'Vidéoconsultation',
      description: 'Consultation à distance avec votre professionnel de santé depuis chez vous',
      icon: Video,
      color: 'bg-orange-500'
    },
    {
      title: 'Sécurisé et confidentiel',
      description: 'Vos données de santé sont protégées et sécurisées',
      icon: Shield,
      color: 'bg-teal-500'
    }
  ];

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    } else {
      // Save onboarding complete
      localStorage.setItem('onboarding_complete', 'true');
      goto('/dashboard/patient');
    }
  }

  function skip() {
    localStorage.setItem('onboarding_complete', 'true');
    goto('/dashboard/patient');
  }

  onMount(() => {
    // Check if already seen
    if (localStorage.getItem('onboarding_complete') === 'true') {
      goto('/dashboard/patient');
    }
  });
</script>

<div class="min-h-screen bg-gradient-to-b from-primary/10 to-white flex flex-col">
  <!-- Progress -->
  <div class="p-4">
    <div class="flex gap-2 justify-center">
      {#each steps as _, i}
        <div 
          class="h-2 rounded-full transition-all {i <= currentStep ? 'w-8 bg-primary' : 'w-2 bg-gray-300'}"
        ></div>
      {/each}
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div class="w-32 h-32 {steps[currentStep].color} rounded-full flex items-center justify-center mb-8 shadow-lg">
      <svelte:component this={steps[currentStep].icon} class="w-16 h-16 text-white" />
    </div>
    
    <h1 class="text-3xl font-bold mb-4">{steps[currentStep].title}</h1>
    <p class="text-gray-600 max-w-md">{steps[currentStep].description}</p>
  </div>

  <!-- Actions -->
  <div class="p-8 space-y-4">
    <button 
      on:click={nextStep}
      class="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
    >
      {currentStep === steps.length - 1 ? 'Commencer' : 'Suivant'}
      <ArrowRight class="w-5 h-5" />
    </button>
    
    <button 
      on:click={skip}
      class="w-full text-gray-500 py-2"
    >
      Passer l'onboarding
    </button>
  </div>
</div>
