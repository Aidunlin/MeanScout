<script lang="ts">
  import type { Entry } from "$lib/entries";
  import { newEntry, validateEntry } from "$lib/entries";
  import type { Survey } from "$lib/surveys";
  import IconButton from "./IconButton.svelte";
  import MetricEditor from "./MetricEditor.svelte";

  export let currentSurvey: Survey;
  export let currentEntry: Entry;

  function saveEntry() {
    let error = validateEntry(currentSurvey, currentEntry);
    if (error) {
      alert(`Could not save entry! ${error}`);
    } else if (confirm("Confirm save?")) {
      currentSurvey.entries = [...currentSurvey.entries, currentEntry];
      currentEntry = newEntry(currentSurvey, currentEntry.match + 1);
    }
  }

  function resetEntry() {
    currentEntry = newEntry(currentSurvey, currentEntry.match);
  }

  function askResetEntry() {
    if (confirm("Confirm reset?")) {
      resetEntry();
    }
  }
</script>

<div class="flex spaced">
  <div>
    Team
    <input id="metric-team" list="teams-list" maxlength="5" bind:value={currentEntry.team} />
    <datalist id="teams-list">
      {#each currentSurvey.teams as team}
        <option value={team} />
      {/each}
    </datalist>
  </div>
  <div>
    Match
    <input id="metric-match" type="number" pattern="[0-9]*" bind:value={currentEntry.match} />
  </div>
  <MetricEditor config={{ name: "Absent", type: "toggle" }} bind:value={currentEntry.isAbsent} />
</div>

<div class="flex spaced" class:hide={currentEntry.isAbsent}>
  {#each currentSurvey.configs as config, i}
    <MetricEditor {config} bind:value={currentEntry.metrics[i]} />
  {/each}
</div>

<div class="flex space-between spaced bg extend-bg extend-down">
  <IconButton on:click={saveEntry} icon="save" text="Save" />
  <IconButton on:click={askResetEntry} icon="reset" text="Reset" />
</div>
