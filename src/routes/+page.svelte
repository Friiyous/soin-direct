<script lang="ts">
  export let data;
  export let params = {};
  import { Heart, Shield, Clock, MapPin, ArrowRight, Droplets, Stethoscope, Syringe, Activity, Pill, UserCheck } from 'lucide-svelte';
  import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
  const dashboardImg = '/dashboard-admin.png';
  const mobileImg = '/mobile-home.png';
  const loginImg = '/login-page.png';
  const appointmentsImg = '/appointments.png';
</script>

<div class="min-h-screen dark:bg-gray-900">
  <!-- Header -->
  <header class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Heart class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold text-primary dark:text-white">SoinDirect</span>
        </div>
        <div class="flex gap-4 items-center">
          <ThemeToggle />
          <a href="/auth/login" class="text-gray-600 dark:text-gray-300 hover:text-primary font-medium">
            Connexion
          </a>
          <a href="/auth/register" class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Inscription
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- Hero -->
  <section class="bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Texte à gauche -->
        <div class="text-center md:text-left">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Des soins à domicile de<br />
            <span class="text-primary">qualité dans le PORO</span>
          </h1>
          <p class="text-xl text-gray-700 dark:text-gray-200 mb-4">
            Votre santé, notre priorité. Recevez des soins professionnels sans vous déplacer.
          </p>
          <p class="text-lg text-gray-500 dark:text-gray-400 mb-8">
            Simples, rapides, fiables - disponibles dans toute la région PORO
          </p>
          <div class="flex gap-4 justify-center md:justify-start flex-wrap">
            <a href="/auth/register" class="btn-primary text-lg px-8 py-4">
              Demander un soin
              <ArrowRight class="inline ml-2 w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Image à droite -->
        <div class="hidden md:block">
          <img
            src={mobileImg}
            alt="Application SoinDirect"
            class="rounded-3xl shadow-2xl w-full max-w-md mx-auto transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Images de l'application -->
  <section class="py-16 bg-gradient-to-b from-white to-primary/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Découvrez l'application</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Une interface moderne et intuitive pour gérer vos soins à domicile
        </p>
      </div>

      <!-- Grille Pinterest-style -->
      <div class="columns-1 md:columns-2 lg:columns-4 gap-6 space-y-6">
        <div class="break-inside-avoid">
          <img
            src={dashboardImg}
            alt="Dashboard Admin"
            class="rounded-2xl shadow-xl w-full hover:scale-105 transition-transform duration-300"
          />
          <p class="text-center mt-3 text-sm font-medium text-gray-700">Dashboard Administrateur</p>
        </div>
        <div class="break-inside-avoid">
          <img
            src={mobileImg}
            alt="Application Mobile"
            class="rounded-2xl shadow-xl w-full hover:scale-105 transition-transform duration-300"
          />
          <p class="text-center mt-3 text-sm font-medium text-gray-700">Vue Mobile</p>
        </div>
        <div class="break-inside-avoid">
          <img
            src={loginImg}
            alt="Page de connexion"
            class="rounded-2xl shadow-xl w-full hover:scale-105 transition-transform duration-300"
          />
          <p class="text-center mt-3 text-sm font-medium text-gray-700">Connexion</p>
        </div>
        <div class="break-inside-avoid">
          <img
            src={appointmentsImg}
            alt="Rendez-vous"
            class="rounded-2xl shadow-xl w-full hover:scale-105 transition-transform duration-300"
          />
          <p class="text-center mt-3 text-sm font-medium text-gray-700">Gestion des RDV</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Services -->
  <section class="py-16 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Nos Services</h2>
      <p class="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
        Nous proposons une gamme complète de soins à domicile pour répondre à tous vos besoins.
      </p>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Pansement -->
        <div class="card hover:shadow-md transition-shadow text-center">
          <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span class="text-4xl">🩹</span>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Pansements</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Pansements simples, complexes, post-opératoires. Changez vos pansements en toute sécurité à la maison.
          </p>
        </div>

        <!-- Prise de sang -->
        <div class="card hover:shadow-md transition-shadow text-center">
          <div class="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span class="text-4xl">💉</span>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Prise de Sang</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Analyses sanguines à domicile. Prélèvements rapides et envoyés au laboratoire pour analyse.
          </p>
        </div>

        <!-- tension -->
        <div class="card hover:shadow-md transition-shadow text-center">
          <div class="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span class="text-4xl">❤️</span>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Mesure de Tension</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Contrôle de la tension artérielle. Suivi régulier pour les personnes hypertendues.
          </p>
        </div>

        <!-- Perfusion -->
        <div class="card hover:shadow-md transition-shadow text-center">
          <div class="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span class="text-4xl">💊</span>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Perfusion</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Pose et surveillance de perfusions. Soins intraveineux à domicile sous supervision médicale.
          </p>
        </div>

        <!-- Injection -->
        <div class="card hover:shadow-md transition-shadow text-center">
          <div class="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span class="text-4xl">💪</span>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Injections</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Injections intramusculaires, sous-cutanées. Vaccination et traitements injectables.
          </p>
        </div>

        <!-- Surveillance -->
        <div class="card hover:shadow-md transition-shadow text-center">
          <div class="w-20 h-20 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span class="text-4xl">🩺</span>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Surveillance</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Surveillance post-opératoire, suivi de traitement. Monitoring médical à domicile.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pour qui ? -->
  <section class="py-16 bg-gray-50 dark:bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Pour qui ?</h2>
      <p class="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
        SoinDirect s'adresse à tous ceux qui ont besoin de soins médicaux à domicile.
      </p>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="card text-center">
          <UserCheck class="w-10 h-10 mx-auto text-primary mb-3" />
          <h3 class="font-semibold mb-2 text-gray-900 dark:text-white">Personnes âgées</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Suivi médical à domicile pour les seniors qui ont du mal à se déplacer.
          </p>
        </div>

        <div class="card text-center">
          <UserCheck class="w-10 h-10 mx-auto text-primary mb-3" />
          <h3 class="font-semibold mb-2 text-gray-900 dark:text-white">Patients chroniques</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Diabète, hypertension - suivi régulier sans contrainte de déplacement.
          </p>
        </div>

        <div class="card text-center">
          <UserCheck class="w-10 h-10 mx-auto text-primary mb-3" />
          <h3 class="font-semibold mb-2 text-gray-900 dark:text-white">Post-opération</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Convalescence à domicile après une opération chirurgicale.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pourquoi nous -->
  <section class="py-16 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-3 gap-8">
        <div class="card text-center">
          <div class="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield class="w-7 h-7 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Professionnels Vérifiés</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Tous nos praticiens sont agréés, diplômes vérifiés et sélectionnés avec soin.
          </p>
        </div>

        <div class="card text-center">
          <div class="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock class="w-7 h-7 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Disponible 7j/7</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Besoin urgent ? Nous répondons rapidement à vos demandes, même le dimanche.
          </p>
        </div>

        <div class="card text-center">
          <div class="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin class="w-7 h-7 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Proche de chez vous</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Nous couvrons toute la région PORO. Un professionnel près de votre domicile.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-16 bg-primary">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold text-white mb-4">
        Prêt à recevoir des soins à domicile ?
      </h2>
      <p class="text-white/80 text-lg mb-8">
        Inscrivez-vous en 2 minutes et recevez des soins de qualité.
      </p>
      <div class="flex gap-4 justify-center flex-wrap">
        <a
          href="/auth/register"
          class="inline-block bg-white text-primary font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Créer mon compte
        </a>
        <a
          href="/auth/login"
          class="inline-block bg-transparent text-white font-semibold px-8 py-4 rounded-xl border-2 border-white hover:bg-white/10 transition-colors"
        >
          Se connecter
        </a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <Heart class="w-6 h-6 text-primary" />
          <span class="text-xl font-bold">SoinDirect</span>
        </div>
        <p class="text-gray-400">
          © 2024 SoinDirect PORO. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
</div>
