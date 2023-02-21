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

  function newEntryClicked(match?: number) {
    let newEntry: Entry = {
      team: "",
      match: match ?? 1,
      isAbsent: false,
      metrics: $surveys[surveyIndex].configs.map(getMetricDefaultValue),
    };
    $surveys[surveyIndex].entries = [newEntry, ...$surveys[surveyIndex].entries];
    editEntryClicked(0);
  }

  function editEntryClicked(i: number) {
    goto(`/${surveyIndex}/${i}`);
  }

  function saveEntryClicked(i: number) {
    let error = validateEntry($surveys[surveyIndex], $surveys[surveyIndex].entries[i]);
    if (error) {
      alert(`Could not save entry! ${error}`);
    } else if (confirm("Confirm save?")) {
      newEntryClicked($surveys[surveyIndex].entries[i].match);
    }
  }

  function resetEntryClicked(i: number) {
    if (!confirm("Confirm reset?")) return;

    $surveys[surveyIndex].entries[i].isAbsent = false;
    $surveys[surveyIndex].entries[i].metrics = $surveys[surveyIndex].configs.map(getMetricDefaultValue);
  }
</script>

<svelte:head>
  <title>{$surveys[surveyIndex].name} | MeanScout</title>
</svelte:head>

<Header>
  <Button icon="back" title="Back to survey" on:click={() => goto(`/${surveyIndex}`)} />
  <h1>{$surveys[surveyIndex].name}</h1>
</Header>

<EntryEditor
  bind:survey={$surveys[surveyIndex]}
  bind:entry={$surveys[surveyIndex].entries[entryIndex]}
/>

<footer>
  <Button icon="save" title="Save entry" on:click={() => saveEntryClicked(entryIndex)} />
  <Button icon="reset" title="reset entry" on:click={() => resetEntryClicked(entryIndex)} />
</footer>
