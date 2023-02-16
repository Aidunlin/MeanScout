<script lang="ts">
  import { ms, backupSurvey } from "$lib/Global.svelte";
  import Metric from "$lib/Metric.svelte";
</script>

<div class="flex spaced" class:hide={$ms.isAbsent}>
  {#each $ms.metrics as _, i}
    <Metric bind:config={$ms.metrics[i].config} bind:value={$ms.metrics[i].value} on:update={() => backupSurvey($ms)} />
  {/each}
</div>
