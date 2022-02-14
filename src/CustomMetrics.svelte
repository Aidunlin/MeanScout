<script>
  import { ms, getSurvey } from "./global.js";
  import Metric from "./Metric.svelte";

  function backupSurvey() {
    localStorage.backup = JSON.stringify(getSurvey($ms));
  }
</script>

<div class="flex spaced" class:hide={$ms.isAbsent}>
  {#each $ms.currentTemplate.metrics ?? [] as metric, i}
    <Metric
      {...metric}
      bind:name={$ms.customMetrics[i].name}
      bind:value={$ms.customMetrics[i].value}
      on:update={backupSurvey}
    />
  {/each}
</div>
