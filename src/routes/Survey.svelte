<script lang="ts">
  import { defaultMetrics, teamWhitelist, savedSurveys, customMetrics } from "$lib/stores";
  import { resetMetric } from "$lib/metrics";
  import { getSurvey, validateSurvey } from "$lib/surveys";
  import Metric from "./Metric.svelte";
  import IconButton from "./IconButton.svelte";

  /** Saves survey to localStorage */
  function saveSurvey() {
    let error = validateSurvey($defaultMetrics, $teamWhitelist);
    if (error) {
      alert(`Could not save survey! ${error}`);
    } else if (confirm("Confirm save?")) {
      $savedSurveys = [...$savedSurveys, getSurvey($defaultMetrics, $customMetrics)];
      resetSurvey();
      $defaultMetrics.match++;
    }
  }

  /** Resets all metrics excluding match */
  function resetSurvey() {
    $defaultMetrics.team = "";
    $defaultMetrics.isAbsent = false;
    $customMetrics = $customMetrics.map(resetMetric);
  }

  /** Prompts the user if they want to reset, then calls `resetSurvey()` */
  function askResetSurvey() {
    if (confirm("Confirm reset?")) {
      resetSurvey();
    }
  }
</script>

<div class="flex spaced">
  <span class="group">Info</span>
  <div>
    Team
    <input id="metric-team" list="teams-list" maxlength="5" bind:value={$defaultMetrics.team} />
    <datalist id="teams-list">
      {#each $teamWhitelist as team}
        <option value={team} />
      {/each}
    </datalist>
  </div>
  <div>
    Match
    <input id="metric-match" type="number" pattern="[0-9]*" bind:value={$defaultMetrics.match} />
  </div>
  <Metric config={{ name: "Absent", type: "toggle" }} bind:value={$defaultMetrics.isAbsent} />
</div>

<div class="flex spaced" class:hide={$defaultMetrics.isAbsent}>
  {#each $customMetrics as _, i}
    <Metric bind:config={$customMetrics[i].config} bind:value={$customMetrics[i].value} />
  {/each}
</div>

<div class="flex space-between spaced bg extend-bg extend-down">
  <IconButton on:click={saveSurvey} icon="save" text="Save" />
  <IconButton on:click={askResetSurvey} icon="reset" text="Reset" />
</div>
