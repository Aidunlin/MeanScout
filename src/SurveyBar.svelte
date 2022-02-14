<script>
  import { ms, getSurvey } from "./global.js";
  import Icon from "./Icon.svelte";

  /** Returns a truthy string if the survey is valid, empty string otherwise */
  function validateSurvey() {
    if (!/^\d{1,4}[A-Z]?$/.test($ms.team)) {
      return "Invalid team value";
    }

    if ($ms.currentTemplate.teams) {
      if (!$ms.currentTemplate.teams.some((team) => team == $ms.team)) {
        return "Team value not whitelisted";
      }
    }

    if (!/\d{1,3}/.test($ms.match)) {
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
    $ms.customMetrics.forEach((metric) => (metric.value = metric.default));
  }

  /** Prompts the user if they want to reset, then calls `resetSurvey()` */
  function askResetSurvey() {
    if (prompt("Type 'reset' to reset the survey") == "reset") {
      resetSurvey();
    }
  }
</script>

<div class="flex space-between spaced bg extend-down">
  <div>
    <button on:click={saveSurvey}>
      <Icon name="save" text="Save" />
    </button>
  </div>
  <div>
    <button on:click={askResetSurvey}>
      <Icon name="reset" text="Reset" />
    </button>
  </div>
</div>
