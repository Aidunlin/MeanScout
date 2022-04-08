<script lang="ts">
  import { ms, backupSurvey } from "./Global.svelte";
  import Metric from "./Metric.svelte";
</script>

<div class="flex spaced" class:hide={$ms.isAbsent}>
  {#each $ms.template?.metrics ?? [] as metric, i}
    <Metric
      {...metric}
      bind:name={$ms.metrics[i].name}
      bind:value={$ms.metrics[i].value}
      on:update={() => backupSurvey($ms)}
    />
  {/each}
</div>
