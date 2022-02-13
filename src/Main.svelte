<script>
  import { msData, exampleTemplate } from "./stores.js";
  import Icon from "./Icon.svelte";
  import Metric, { getDefaultValue } from "./Metric.svelte";

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

  function validateSurvey() {
    if (!/^\d{1,4}[A-Z]?$/.test($msData.team)) {
      document.querySelector("#metric-team").focus();
      return "Invalid team value";
    }

    if ($msData.currentTemplate.teams) {
      if (!$msData.currentTemplate.teams.some((team) => team == $msData.team)) {
        document.querySelector("#metric-team").focus();
        return "Team value not whitelisted";
      }
    }

    if (!/\d{1,3}/.test($msData.match)) {
      document.querySelector("#metric-match").focus();
      return "Invalid match value";
    }

    return "";
  }

  function saveSurvey() {
    let error = validateSurvey();

    if (error) {
      alert(`Could not save survey! ${error}`);
    } else if (confirm("Confirm save?")) {
      let surveys = JSON.parse(localStorage.surveys ?? "[]");
      surveys.push(getSurvey());
      localStorage.surveys = JSON.stringify(surveys);
      resetSurvey();
      $msData.match++;
    }
  }

  function resetSurvey() {
    $msData.team = "";
    $msData.isAbsent = false;
    $msData.customMetrics.forEach((metric) => (metric.value = metric.default));
    document.querySelector("#metric-team").focus();
    localStorage.backup = "";
  }

  function askResetSurvey() {
    if (prompt("Type 'reset' to reset the survey") == "reset") {
      resetSurvey();
    }
  }

  function loadTemplate() {
    $msData.currentTemplate = JSON.parse(
      localStorage.template ?? JSON.stringify($exampleTemplate)
    );

    $msData.customMetrics = $msData.currentTemplate.metrics.map((metric) => {
      let defaultValue = getDefaultValue(metric.type);

      if (metric.type == "select") {
        defaultValue = metric.values[0];
      }

      return { ...metric, value: defaultValue, default: defaultValue };
    });
  }

  function loadBackup() {
    const backup = JSON.parse(localStorage.backup);
    $msData.team = backup.find((metric) => metric.name == "Team").value;
    $msData.match = backup.find((metric) => metric.name == "Match").value;
    $msData.isAbsent = backup.find((metric) => metric.name == "Absent").value;

    $msData.customMetrics.forEach((metric) => {
      metric.value = backup.find((m) => m.name == metric.name).value;
    });
  }

  function load() {
    loadTemplate();
    
    if (localStorage.backup) {
      loadBackup();
    }
  }
</script>

<svelte:window on:load={load} />

<div class="flex">
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

  <span class="group">Survey</span>
  <div class="flex spaced">
    <button on:click={saveSurvey}>
      <Icon name="save" text="Save" />
    </button>
    <button on:click={askResetSurvey}>
      <Icon name="reset" text="Reset" />
    </button>
  </div>
</div>
