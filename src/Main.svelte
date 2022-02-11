<script>
  import Icon from "./Icon.svelte";
  import {
    ToggleMetric,
    NumberMetric,
    SelectMetric,
    TextMetric,
    RatingMetric,
    TimerMetric,
  } from "./metrics/metrics.js";

  export let matchCount = 1;
  export let isAbsent = false;
</script>

<div class="flex" id="main">
  <div class="flex spaced" id="metrics-default">
    <div>
      Team
      <input id="metric-team" list="teams" maxlength="5" />
      <datalist id="teams-list" />
    </div>
    <div>
      Match
      <input
        id="metric-match"
        type="number"
        bind:value={matchCount}
        pattern="[0-9]*"
      />
    </div>
    <div>
      <ToggleMetric name="Absent" bind:value={isAbsent} />
    </div>
  </div>
  
  <div class="flex spaced" id="metrics-custom" class:hide={isAbsent}>
    <ToggleMetric />
    <NumberMetric />
    <SelectMetric />
    <TextMetric />
    <RatingMetric />
    <TimerMetric />
  </div>

  <span class="group">Survey</span>
  <div class="flex spaced">
    <button id="survey-save-btn">
      <Icon name="save" text="Save" />
    </button>
    <button id="survey-reset-btn">
      <Icon name="reset" text="Reset" />
    </button>
  </div>
</div>
