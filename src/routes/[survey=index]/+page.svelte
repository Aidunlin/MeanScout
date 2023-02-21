<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/Button.svelte";
  import type { Entry } from "$lib/entries";
  import Header from "$lib/Header.svelte";
  import { getMetricDefaultValue } from "$lib/metrics";
  import { surveys } from "$lib/stores";
  import { downloadSurveyEntries } from "$lib/surveys";
  import type { PageData } from "./$types";

  export let data: PageData;
  let { surveyIndex } = data;

  function editEntryClicked(entryIndex: number) {
    goto(`/${surveyIndex}/${entryIndex}`);
  }

  function deleteEntryClicked(entryIndex: number) {
    if (!confirm("Confirm delete?")) return;

    $surveys[surveyIndex].entries = $surveys[surveyIndex].entries.filter((_, i) => i != entryIndex);
  }

  function copySurveyClicked() {
    let surveyString = JSON.stringify($surveys[surveyIndex]);

    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(surveyString);
      alert("Copied survey");
    } else {
      prompt("Copy the survey below", surveyString);
    }
  }

  function downloadEntriesClicked() {
    if (!confirm("Confirm download?")) return;

    downloadSurveyEntries($surveys[surveyIndex]);
  }

  function newEntryClicked() {
    let entry: Entry = {
      team: "",
      match: $surveys[surveyIndex].entries.map(entry => entry.match).reduce((prev, curr) => curr > prev ? curr : prev) + 1,
      isAbsent: false,
      metrics: $surveys[surveyIndex].configs.map(getMetricDefaultValue),
    };
    $surveys[surveyIndex].entries = [entry, ...$surveys[surveyIndex].entries];
  }
</script>

<svelte:head>
  <title>{$surveys[surveyIndex].name} | MeanScout</title>
</svelte:head>

<Header>
  <Button icon="back" title="Back to surveys" on:click={() => goto("/")} />
  <h1>{$surveys[surveyIndex].name}</h1>
</Header>

<div class="flex spaced">
  <h2>Entries</h2>
  {#each $surveys[surveyIndex].entries as entry, entryIndex (entry)}
    <div class="flex spaced-inner space-between max-width">
      <div class="flex spaced-inner">
        <Button icon="pen" title="Edit entry" on:click={() => editEntryClicked(entryIndex)} />
        <span>Team {entry.team} Match {entry.match}</span>
      </div>
      <Button icon="delete" title="Delete entry" on:click={() => deleteEntryClicked(entryIndex)} />
    </div>
  {/each}
</div>

<footer>
  <Button icon="plus" title="New entry" on:click={newEntryClicked} />
  <div>
    <Button icon="copy" title="Copy survey" on:click={copySurveyClicked} />
    <Button icon="download" title="Download entries" on:click={downloadEntriesClicked} />
  </div>
</footer>
