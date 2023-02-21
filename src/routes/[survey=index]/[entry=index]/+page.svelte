<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/Button.svelte";
  import { validateEntry, type Entry } from "$lib/entries";
  import Header from "$lib/Header.svelte";
  import { getMetricDefaultValue } from "$lib/metrics";
  import { surveys } from "$lib/stores";
  import type { PageData } from "./$types";
  import EntryEditor from "./EntryEditor.svelte";

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
  <title>{$surveys[surveyIndex].name} | MeanScout</title>
</svelte:head>

<Header>
  <Button icon="back" title="Back to survey" on:click={() => goto(`/${surveyIndex}`)} />
  <h1>{$surveys[surveyIndex].name}</h1>
</Header>

<EntryEditor bind:survey={$surveys[surveyIndex]} bind:entry={$surveys[surveyIndex].entries[entryIndex]} />

<footer>
  <Button icon="save" title="Save entry" on:click={saveEntryClicked} />
  <Button icon="reset" title="reset entry" on:click={resetEntryClicked} />
</footer>
