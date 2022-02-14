<script>
  import { ms, getSurvey } from "./global.js";
  import Metric from "./Metric.svelte";

  function backupSurvey() {
    localStorage.backup = JSON.stringify(getSurvey($ms));
  }
</script>

<div class="flex spaced" class:hide={$ms.isAbsent}>
  {#each $ms.currentTemplate.metrics ?? [] as metric, i}
    {#if metric.group}
      <span class="group">{metric.group}</span>
    {/if}
    <Metric
      bind:name={$ms.customMetrics[i].name}
      type={metric.type}
      bind:value={$ms.customMetrics[i].value}
      values={metric.values ?? [""]}
      tip={metric.tip ?? ""}
      on:update={backupSurvey}
    />
  {/each}
</div>
