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

  function editEntryClicked(i: number) {
    goto(`/${surveyIndex}/${i}`);
  }

  function deleteEntryClicked(i: number) {
    if (typeof surveyIndex == "undefined") return;
    if (!confirm("Confirm delete?")) return;

    $surveys[surveyIndex].entries = $surveys[surveyIndex].entries.filter((_, idx) => idx != i);
  }

  function copySurveyClicked(i: number) {
    let surveyString = JSON.stringify($surveys[i]);
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(surveyString);
      alert("Copied survey");
    } else {
      prompt("Copy the survey below", surveyString);
    }
  }

  function downloadEntriesClicked(i: number) {
    if (!confirm("Confirm download?")) return;

    downloadSurveyEntries($surveys[i]);
  }

  function newEntryClicked(match?: number) {
    if (typeof surveyIndex == "undefined") return;

    let newEntry: Entry = {
      team: "",
      match: match ?? 1,
      isAbsent: false,
      metrics: $surveys[surveyIndex].configs.map(getMetricDefaultValue),
    };
    $surveys[surveyIndex].entries = [newEntry, ...$surveys[surveyIndex].entries];
    editEntryClicked(0);
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
  <span class="group">Entries</span>
  {#each $surveys[surveyIndex].entries as entry, i (entry)}
    <div class="flex spaced-inner space-between max-width">
      <span>Team {entry.team} Match {entry.match}</span>
      <div>
        <Button icon="pen" title="Edit entry" on:click={() => editEntryClicked(i)} />
        <Button icon="delete" title="Delete entry" on:click={() => deleteEntryClicked(i)} />
      </div>
    </div>
  {/each}
</div>

<footer>
  <Button icon="plus" title="New entry" on:click={() => newEntryClicked()} />
  <div>
    <Button icon="copy" title="Copy survey" on:click={() => copySurveyClicked(surveyIndex)} />
    <Button icon="download" title="Download entries" on:click={() => downloadEntriesClicked(surveyIndex)} />
  </div>
</footer>
