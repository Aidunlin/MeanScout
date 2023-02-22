<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/Button.svelte";
  import { validateEntry, type Entry } from "$lib/entries";
  import Header from "$lib/Header.svelte";
  import { getMetricDefaultValue } from "$lib/metrics";
  import { surveys } from "$lib/stores";
  import type { PageData } from "./$types";
  import MetricEditor from "./MetricEditor.svelte";

  export let data: PageData;
  let { surveyIndex, entryIndex } = data;

  function editEntryClicked(i: number) {
    goto(`/${surveyIndex}/${i}`);
  }

  function saveEntryClicked() {
    let error = validateEntry($surveys[surveyIndex], $surveys[surveyIndex].entries[entryIndex]);

    if (error) {
      alert(`Could not save entry! ${error}`);
      return;
    }

    if (!confirm("Confirm save?")) return;

    let entry: Entry = {
      team: "",
      match: $surveys[surveyIndex].entries[entryIndex].match + 1,
      isAbsent: false,
      metrics: $surveys[surveyIndex].configs.map(getMetricDefaultValue),
    };
    $surveys[surveyIndex].entries = [entry, ...$surveys[surveyIndex].entries];
    editEntryClicked(0);
  }

  function resetEntryClicked() {
    if (!confirm("Confirm reset?")) return;

    $surveys[surveyIndex].entries[entryIndex].isAbsent = false;
    $surveys[surveyIndex].entries[entryIndex].metrics = $surveys[surveyIndex].configs.map(getMetricDefaultValue);
  }
</script>

<svelte:head>
  <title>Entry ({$surveys[surveyIndex].name}) | MeanScout</title>
</svelte:head>

<Header>
  <Button icon="back" title="Back to survey" on:click={() => goto(`/${surveyIndex}`)} />
  <h1>Entry ({$surveys[surveyIndex].name})</h1>
</Header>

<div class="flex-row padding align-end">
  <div>
    Team
    <input
      id="metric-team"
      list="teams-list"
      maxlength="5"
      bind:value={$surveys[surveyIndex].entries[entryIndex].team}
    />
    <datalist id="teams-list">
      {#each $surveys[surveyIndex].teams as team}
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
      bind:value={$surveys[surveyIndex].entries[entryIndex].match}
    />
  </div>
  <MetricEditor
    config={{ name: "Absent", type: "toggle" }}
    bind:value={$surveys[surveyIndex].entries[entryIndex].isAbsent}
  />
</div>

<div class="flex-row padding align-end" class:hide={$surveys[surveyIndex].entries[entryIndex].isAbsent}>
  {#each $surveys[surveyIndex].configs as config, i}
    <MetricEditor {config} bind:value={$surveys[surveyIndex].entries[entryIndex].metrics[i]} />
  {/each}
</div>

<footer>
  <Button icon="save" title="Save entry" on:click={saveEntryClicked} />
  <Button icon="reset" title="reset entry" on:click={resetEntryClicked} />
</footer>
