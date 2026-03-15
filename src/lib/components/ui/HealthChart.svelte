<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  export let data: { label: string; value: number }[] = [];
  export let label = 'Valeur';
  export let color = '#0057B7';

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart;

  onMount(() => {
    const ctx = chartCanvas.getContext('2d');
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label,
          data: data.map(d => d.value),
          borderColor: color,
          backgroundColor: color + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: color
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  });

  onDestroy(() => {
    if (chart) chart.destroy();
  });

  $: if (chart && data) {
    chart.data.labels = data.map(d => d.label);
    chart.data.datasets[0].data = data.map(d => d.value);
    chart.update();
  }
</script>

<div class="h-64 w-full">
  <canvas bind:this={chartCanvas}></canvas>
</div>
