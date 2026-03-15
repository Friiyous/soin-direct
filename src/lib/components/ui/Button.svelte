<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' | 'outline' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
  export let className = '';
  export let href = '';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary/5',
    ghost: 'text-primary hover:bg-primary/10',
    outline: 'bg-transparent text-foreground border border-border hover:bg-accent hover:text-accent-foreground'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  };

  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-[var(--radius)] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
</script>

{#if href}
  <a
    {href}
    class="{baseStyles} {variants[variant]} {sizes[size]} {className}"
    on:click
  >
    <slot />
  </a>
{:else}
  <button
    {type}
    {disabled}
    class="{baseStyles} {variants[variant]} {sizes[size]} {className}"
    on:click
  >
    <slot />
  </button>
{/if}
