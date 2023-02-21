<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { validateEntry, type Entry } from "$lib/entries";
  import { getMetricDefaultValue } from "$lib/metrics";
  import { entryIndex, localStorageStore, surveyIndex, surveys } from "$lib/stores";
  import { downloadSurveyEntries, parseSurvey, type Survey } from "$lib/surveys";
  import EntryEditor from "./EntryEditor.svelte";

  const locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"] as const;
  type Location = typeof locations[number];
  const currentLocation = localStorageStore<Location>("currentLocation", "Red Near", setTheme);

  function setTheme(location: Location) {
    let newTheme = location.split(" ")[0].toLowerCase();
    document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
  }

  function newSurveyClicked() {
    let name = prompt("Enter new survey name:");

    if (!name) return;
    if ($surveys.map((survey) => survey.name).includes(name)) {
      alert("That name is already used!");
      return;
    }

    let survey: Survey = {
      name,
      configs: [],
      teams: [],
      entries: [],
    };
    $surveys = [survey, ...$surveys];
    editSurveyClicked(0);
  }

  function pasteSurveyClicked() {
    const newPrompt = prompt("Paste new survey:");
    if (newPrompt) {
      let result = parseSurvey(newPrompt);
      if (typeof result == "string") {
        alert(`Could not set survey! ${result}`);
      } else {
        if ($surveys.map((survey) => survey.name).includes(result.name)) {
          alert(`Could not set survey! ${result.name} already exists`);
        } else {
          $surveys = [result, ...$surveys];
          editSurveyClicked(0);
        }
      }
    }
  }

  function editSurveyClicked(i: number) {
    $surveyIndex = i;
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

  function deleteSurveyClicked(i: number) {
    if (!confirm("Confirm delete?")) return;

    $entryIndex = undefined;
    $surveyIndex = undefined;

    if ($surveys.length > 1) {
      $surveys = $surveys.splice(i, 1);
    } else {
      $surveys = [];
    }
  }

  function newEntryClicked(match?: number) {
    if (typeof $surveyIndex == "undefined") return;

    let newEntry: Entry = {
      team: "",
      match: match ?? 1,
      isAbsent: false,
      metrics: $surveys[$surveyIndex].configs.map(getMetricDefaultValue),
    };
    $surveys[$surveyIndex].entries = [newEntry, ...$surveys[$surveyIndex].entries];
    editEntryClicked(0);
  }

  function editEntryClicked(i: number) {
    $entryIndex = i;
  }

  function saveEntryClicked(i: number) {
    if (typeof $surveyIndex == "undefined") return;

    let error = validateEntry($surveys[$surveyIndex], $surveys[$surveyIndex].entries[i]);
    if (error) {
      alert(`Could not save entry! ${error}`);
    } else if (confirm("Confirm save?")) {
      newEntryClicked($surveys[$surveyIndex].entries[i].match);
    }
  }

  function resetEntryClicked(i: number) {
    if (typeof $surveyIndex == "undefined") return;
    if (!confirm("Confirm reset?")) return;

    $surveys[$surveyIndex].entries[i].isAbsent = false;
    $surveys[$surveyIndex].entries[i].metrics = $surveys[$surveyIndex].configs.map(getMetricDefaultValue);
  }

  function deleteEntryClicked(i: number) {
    if (typeof $surveyIndex == "undefined") return;
    if (!confirm("Confirm delete?")) return;

    $entryIndex = undefined;

    if ($surveys[$surveyIndex].entries.length > 1) {
      $surveys[$surveyIndex].entries = $surveys[$surveyIndex].entries.splice(i, 1);
    } else {
      $surveys[$surveyIndex].entries = [];
    }
  }
</script>

<header class="flex spaced space-between bg extend-bg">
  <div class="flex spaced-inner">
    {#if $surveyIndex == undefined && $entryIndex == undefined}
      <!-- Surveys -->
      <img id="logo" src="./logo.png" alt="" />
      <h1>MeanScout</h1>
    {:else if $surveyIndex != undefined && $entryIndex == undefined}
      <!-- Entries -->
      <Button icon="back" title="Back to surveys" on:click={() => ($surveyIndex = undefined)} />
      <h1>{$surveys[$surveyIndex].name}</h1>
    {:else if $surveyIndex != undefined && $entryIndex != undefined}
      <!-- Metrics -->
      <Button icon="back" title="Back to survey" on:click={() => ($entryIndex = undefined)} />
      <h1>{$surveys[$surveyIndex].name}</h1>
    {/if}
  </div>
  <div class="flex">
    <select bind:value={$currentLocation} title="Location">
      {#each Object.values(locations) as location}
        <option>{location}</option>
      {/each}
    </select>
  </div>
</header>

{#if $surveyIndex == undefined && $entryIndex == undefined}
  <!-- Surveys -->
  <div class="flex spaced">
    <span class="group">Surveys</span>
    {#each $surveys as survey, i (survey)}
      <div class="flex spaced-inner space-between max-width">
        <span>{survey.name}</span>
        <div>
          <Button icon="pen" title="Edit survey" on:click={() => editSurveyClicked(i)} />
          <Button icon="copy" title="Copy survey" on:click={() => copySurveyClicked(i)} />
          <Button icon="download" title="Download entries" on:click={() => downloadEntriesClicked(i)} />
          <Button icon="delete" title="Delete survey" on:click={() => deleteSurveyClicked(i)} />
        </div>
      </div>
    {:else}
      <span class="flex max-width">Create or paste in a survey to get started!</span>
    {/each}
  </div>
{:else if $surveyIndex != undefined && $entryIndex == undefined}
  <!-- Entries -->
  <div class="flex spaced">
    <span class="group">Entries</span>
    {#each $surveys[$surveyIndex].entries as entry, i (entry)}
      <div class="flex spaced-inner space-between max-width">
        <span>Team {entry.team} Match {entry.match}</span>
        <div>
          <Button icon="pen" title="Edit entry" on:click={() => editEntryClicked(i)} />
          <Button icon="delete" title="Delete entry" on:click={() => deleteEntryClicked(i)} />
        </div>
      </div>
    {/each}
  </div>
{:else if $surveyIndex != undefined && $entryIndex != undefined}
  <!-- Metrics -->
  <EntryEditor bind:survey={$surveys[$surveyIndex]} bind:entry={$surveys[$surveyIndex].entries[$entryIndex]} />
{:else}
  <p>Oops, something went wrong!</p>
  <Button icon="reset" text="Go home" on:click={() => ($surveyIndex = $entryIndex = undefined)} />
{/if}

<footer class="flex spaced space-between bg extend-bg extend-down">
  {#if $surveyIndex == undefined && $entryIndex == undefined}
    <!-- Surveys -->
    <Button icon="plus" title="New survey" on:click={newSurveyClicked} />
    <Button icon="paste" title="New from JSON" on:click={pasteSurveyClicked} />
  {:else if $surveyIndex != undefined && $entryIndex == undefined}
    <!-- Entries -->
    {@const surveyIndex = $surveyIndex}
    <Button icon="plus" title="New entry" on:click={() => newEntryClicked()} />
    <div>
      <Button icon="copy" title="Copy survey" on:click={() => copySurveyClicked(surveyIndex)} />
      <Button icon="download" title="Download entries" on:click={() => downloadEntriesClicked(surveyIndex)} />
      <Button icon="delete" title="Delete survey" on:click={() => deleteSurveyClicked(surveyIndex)} />
    </div>
  {:else if $surveyIndex != undefined && $entryIndex != undefined}
    <!-- Metrics -->
    {@const entryIndex = $entryIndex}
    <Button icon="save" title="Save entry" on:click={() => saveEntryClicked(entryIndex)} />
    <Button icon="reset" title="reset entry" on:click={() => resetEntryClicked(entryIndex)} />
  {/if}
</footer>
