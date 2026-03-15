<script lang="ts">
  export let className = '';
  export let padding = 'p-6';
  export let glass = true;
</script>

<div
  class="rounded-[var(--radius)] transition-all duration-300 {glass ? 'glass' : 'card-premium'} {padding} {className}"
>
  <slot />
</div>
