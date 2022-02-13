<script>
  import { msData } from "./stores.js";
  import Icon from "./Icon.svelte";

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

  function validateSurvey() {
    if (!/^\d{1,4}[A-Z]?$/.test($msData.team)) {
      return "Invalid team value";
    }

    if ($msData.currentTemplate.teams) {
      if (!$msData.currentTemplate.teams.some((team) => team == $msData.team)) {
        return "Team value not whitelisted";
      }
    }

    if (!/\d{1,3}/.test($msData.match)) {
      return "Invalid match value";
    }

    return "";
  }

  function saveSurvey() {
    let error = validateSurvey();

    if (error) {
      alert(`Could not save survey! ${error}`);
    } else if (confirm("Confirm save?")) {
      localStorage.surveys = JSON.stringify([
        ...JSON.parse(localStorage.surveys ?? "[]"),
        getSurvey(),
      ]);
      
      resetSurvey();
      $msData.match++;
    }
  }

  function resetSurvey() {
    $msData.team = "";
    $msData.isAbsent = false;
    $msData.customMetrics.forEach((metric) => (metric.value = metric.default));
    localStorage.backup = "";
  }

  function askResetSurvey() {
    if (prompt("Type 'reset' to reset the survey") == "reset") {
      resetSurvey();
    }
  }
</script>

<div class="flex spaced bg" style="justify-content: space-between">
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
