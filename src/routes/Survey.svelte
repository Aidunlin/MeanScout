<script lang="ts">
  import { defaultMetrics, teamWhitelist, savedSurveys, customMetrics } from "$lib/stores";
  import { getMetricDefaultValue } from "$lib/metrics";
  import { getSurvey } from "$lib/Global.svelte";
  import Metric from "$lib/Metric.svelte";
  import IconButton from "$lib/IconButton.svelte";

  /** Returns a truthy string if the survey is valid, empty string otherwise */
  function validateSurvey() {
    if (!/^\d{1,4}[A-Z]?$/.test($defaultMetrics.team)) {
      return "Invalid team value";
    }
    if ($teamWhitelist.length && !$teamWhitelist.some((team) => team == $defaultMetrics.team)) {
      return "Team value not whitelisted";
    }
    if (!/\d{1,3}/.test(`${$defaultMetrics.match}`)) {
      return "Invalid match value";
    }
    return "";
  }

  /** Saves survey to localStorage */
  function saveSurvey() {
    let error = validateSurvey();
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
    $customMetrics.forEach((metric) => {
      metric.value = getMetricDefaultValue(metric.config);
    });
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
