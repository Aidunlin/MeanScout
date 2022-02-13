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

<div class="flex spaced">
  <div>
    Team
    <input
      id="metric-team"
      list="teams-list"
      maxlength="5"
      bind:value={$msData.team}
      on:change={backupSurvey}
    />
    <datalist id="teams-list">
      {#each $msData.currentTemplate.teams ?? [] as team}
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
      bind:value={$msData.match}
      on:change={backupSurvey}
    />
  </div>
  <div>
    <Metric
      name="Absent"
      type="toggle"
      bind:value={$msData.isAbsent}
      on:update={backupSurvey}
    />
  </div>
</div>
