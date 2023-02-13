<script lang="ts">
  import { ms, backupSurvey } from "./Global.svelte";
  import Metric from "./Metric.svelte";
</script>

<div class="flex spaced">
  <span class="group">Info</span>
  <div>
    Team
    <input
      id="metric-team"
      list="teams-list"
      maxlength="5"
      bind:value={$ms.team}
      on:change={() => backupSurvey($ms)}
    />
    <datalist id="teams-list">
      {#each $ms.teams as team}
        <option value={team} />
      {/each}
    </datalist>
  </div>
  <div>
    Match
    <input
      id="metric-match"
      type="number"
      pattern="[0-9]*"
      bind:value={$ms.match}
      on:change={() => backupSurvey($ms)}
    />
  </div>
  <Metric
    config={{ name: "Absent", type: "toggle" }}
    bind:value={$ms.isAbsent}
    on:update={() => backupSurvey($ms)}
  />
</div>
