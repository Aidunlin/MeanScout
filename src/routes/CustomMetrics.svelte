<script lang="ts">
  import { defaultMetrics, customMetrics } from "$lib/Global.svelte";
  import Metric from "$lib/Metric.svelte";
</script>

<div class="flex spaced" class:hide={$defaultMetrics.isAbsent}>
  {#each $customMetrics as _, i}
    <Metric bind:config={$customMetrics[i].config} bind:value={$customMetrics[i].value} />
  {/each}
</div>
