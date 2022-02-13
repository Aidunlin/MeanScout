<script>
  import { msData } from "./stores.js";
  import Metric from "./Metric.svelte";

  function getSurvey() {
    return [
      { name: "Team", value: $msData.team },
      { name: "Match", value: $msData.match },
      { name: "Absent", value: $msData.isAbsent },

      ...$msData.customMetrics.map((metric) => {
        return { name: metric.name, value: metric.value };
      }),
    ];
  }

  function backupSurvey() {
    localStorage.backup = JSON.stringify(getSurvey());
  }
</script>

<div class="flex spaced" class:hide={$msData.isAbsent}>
  {#each $msData.currentTemplate.metrics ?? [] as metric, i}
    {#if metric.group}
      <span class="group">{metric.group}</span>
    {/if}
    <Metric
      bind:name={$msData.customMetrics[i].name}
      type={metric.type}
      bind:value={$msData.customMetrics[i].value}
      values={metric.values ?? [""]}
      tip={metric.tip ?? ""}
      on:update={backupSurvey}
    />
  {/each}
</div>
