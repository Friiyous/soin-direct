<script lang="ts">
  import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-svelte';

  export let status: 'en_attente' | 'accepte' | 'termine' | 'annule';

  const configs = {
    en_attente: { label: 'En attente', icon: Clock, class: 'bg-warning/10 text-warning border-warning/20' },
    accepte: { label: 'En cours', icon: AlertCircle, class: 'bg-info/10 text-info border-info/20' },
    termine: { label: 'Terminé', icon: CheckCircle, class: 'bg-success/10 text-success border-success/20' },
    annule: { label: 'Annulé', icon: XCircle, class: 'bg-error/10 text-error border-error/20' }
  };

  $: config = configs[status];
</script>

<div
  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider {config.class}"
>
  <svelte:component this={config.icon} size={14} />
  {config.label}
</div>
