<script lang="ts">
  import { validateEntry } from "$lib/entries";
  import { getMetricDefaultValue } from "$lib/metrics";
  import { currentEntry, currentSurveyIndex, surveys } from "$lib/stores";
  import { onMount } from "svelte";
  import IconButton from "./IconButton.svelte";
  import MetricEditor from "./MetricEditor.svelte";

  let currentSurvey = $surveys.at($currentSurveyIndex);

  $: {
    if (currentSurvey) {
      $surveys[$currentSurveyIndex] = currentSurvey;
    }
  }

  onMount(() => {
    if (currentSurvey && !$currentEntry) {
      newEntry();
    }
  });

  function newEntry() {
    if (!currentSurvey) return;
    let match = $currentEntry ? $currentEntry.match + 1 : 1;
    $currentEntry = {
      team: "",
      match,
      isAbsent: false,
      metrics: currentSurvey.configs.map(getMetricDefaultValue),
    };
  }

  function saveEntry() {
    if (!currentSurvey || !$currentEntry) return;
    let error = validateEntry(currentSurvey, $currentEntry);
    if (error) {
      alert(`Could not save entry! ${error}`);
    } else if (confirm("Confirm save?")) {
      currentSurvey.entries = [...currentSurvey.entries, $currentEntry];
      newEntry();
    }
  }

  function resetEntry() {
    if (!currentSurvey || !$currentEntry) return;
    $currentEntry.team = "";
    $currentEntry.isAbsent = false;
    $currentEntry.metrics = currentSurvey.configs.map(getMetricDefaultValue);
  }

  function askResetEntry() {
    if ($currentEntry && confirm("Confirm reset?")) {
      resetEntry();
    }
  }
</script>

{#if currentSurvey && $currentEntry}
  <div class="flex spaced">
    <div>
      Team
      <input id="metric-team" list="teams-list" maxlength="5" bind:value={$currentEntry.team} />
      <datalist id="teams-list">
        {#each currentSurvey.teams as team}
          <option value={team} />
        {/each}
      </datalist>
    </div>
    <div>
      Match
      <input id="metric-match" type="number" pattern="[0-9]*" bind:value={$currentEntry.match} />
    </div>
    <MetricEditor config={{ name: "Absent", type: "toggle" }} bind:value={$currentEntry.isAbsent} />
  </div>

  <div class="flex spaced" class:hide={$currentEntry.isAbsent}>
    {#each currentSurvey.configs as config, i}
      <MetricEditor {config} bind:value={$currentEntry.metrics[i]} />
    {/each}
  </div>

  <div class="flex space-between spaced bg extend-bg extend-down">
    <IconButton on:click={saveEntry} icon="save" text="Save" />
    <IconButton on:click={askResetEntry} icon="reset" text="Reset" />
  </div>
{/if}
