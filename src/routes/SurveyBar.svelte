<script lang="ts">
  import { ms, getSurvey, getMetricDefaultValue } from "./Global.svelte";
  import IconButton from "./IconButton.svelte";

  /** Returns a truthy string if the survey is valid, empty string otherwise */
  function validateSurvey() {
    if (!/^\d{1,4}[A-Z]?$/.test($ms.team)) {
      return "Invalid team value";
    }
    if ($ms.teams.length && !$ms.teams.some((team) => team == $ms.team)) {
      return "Team value not whitelisted";
    }
    if (!/\d{1,3}/.test(`${$ms.match}`)) {
      return "Invalid match value";
    }
    return "";
  }

  /** Checks and saves survey to `localStorage`, then updates the UI */
  function saveSurvey() {
    let error = validateSurvey();
    if (error) {
      alert(`Could not save survey! ${error}`);
    } else if (confirm("Confirm save?")) {
      let updatedSurveys = JSON.stringify([
        ...JSON.parse(localStorage.getItem("surveys") ?? "[]"),
        getSurvey($ms),
      ]);
      localStorage.setItem("surveys", updatedSurveys);
      resetSurvey();
      $ms.match++;
    }
  }

  /** Resets all metrics excluding match */
  function resetSurvey() {
    $ms.team = "";
    $ms.isAbsent = false;
    $ms.metrics.forEach((metric) => {
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

<div class="flex space-between spaced bg extend-bg extend-down">
  <IconButton on:click={saveSurvey} icon="save" text="Save" />
  <IconButton on:click={askResetSurvey} icon="reset" text="Reset" />
</div>
