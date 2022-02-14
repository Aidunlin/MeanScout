<script>
  import { ms, getSurvey } from "./global.js";
  import Metric from "./Metric.svelte";

  function backupSurvey() {
    localStorage.backup = JSON.stringify(getSurvey($ms));
  }
</script>

<div class="flex spaced">
  <div>
    Team
    <input
      id="metric-team"
      list="teams-list"
      maxlength="5"
      bind:value={$ms.team}
      on:change={backupSurvey}
    />
    <datalist id="teams-list">
      {#each $ms.currentTemplate.teams ?? [] as team}
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
      on:change={backupSurvey}
    />
  </div>
  <div>
    <Metric
      name="Absent"
      type="toggle"
      bind:value={$ms.isAbsent}
      on:update={backupSurvey}
    />
  </div>
</div>
