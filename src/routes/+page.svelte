<script lang="ts">
  import { newEntry } from "$lib/entries";
  import { currentEntry, currentSurveyIndex, currentSurveyName, localStorageStore, surveys } from "$lib/stores";
  import { parseSurvey, type Survey } from "$lib/surveys";
  import { onMount } from "svelte";
  import IconButton from "./IconButton.svelte";

  onMount(() => {
    document.body.classList.remove("hide");

    if ($surveys[$currentSurveyIndex]) {
      $currentEntry = newEntry($surveys[$currentSurveyIndex]);
    }
  });

  const locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"] as const;
  type Location = typeof locations[number];
  const currentLocation = localStorageStore<Location>("currentLocation", "Red Near", setTheme);

  function setTheme(location: Location) {
    let newTheme = location.split(" ")[0].toLowerCase();
    document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
  }

  function newSurvey() {
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
    openSurvey(survey.name);
  }

  function pasteSurvey() {
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
          openSurvey(result.name);
        }
      }
    }
  }

  function openSurvey(surveyName: string) {
    $currentSurveyName = surveyName;
  }

  function copySurvey(survey: Survey) {
    let surveyString = JSON.stringify(survey as Omit<Survey, "entries">);
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(surveyString);
      alert("Copied survey");
    } else {
      prompt("Copy the survey below", surveyString);
    }
  }

  function deleteSurvey(survey: Survey) {
    if (!confirm("Confirm delete?")) return;
    $surveys = $surveys.filter((s) => s.name != survey.name);
  }
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<header class="flex spaced space-between bg extend-bg">
  <div class="flex spaced-inner">
    {#if $currentSurveyName}
      <IconButton on:click={() => ($currentSurveyName = "")} icon="back" text="Back" />
      <h1>{$currentSurveyName}</h1>
    {:else}
      <img id="logo" src="./logo.png" alt="" />
      <h1>MeanScout</h1>
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

<div class="flex spaced">
  {#if $currentSurveyName}
    <span class="group">Entries</span>
    {#each $surveys[$currentSurveyIndex].entries as entry (`${entry.team} ${entry.match}`)}
      <div class="flex max-width">
        <button class="list-button-main" title="Open entry">
          Team {entry.team} Match {entry.match}
        </button>
        <div class="flex">
          <IconButton icon="erase" title="Delete entry" />
        </div>
      </div>
    {/each}
  {:else}
    <span class="group">Surveys</span>
    {#each $surveys as survey (survey.name)}
      <div class="flex max-width">
        <button class="list-button-main" title="Open survey" on:click={() => openSurvey(survey.name)}>
          {survey.name}
        </button>
        <div class="flex">
          <IconButton icon="copy" title="Copy survey" on:click={() => copySurvey(survey)} />
          <IconButton icon="erase" title="Delete survey" on:click={() => deleteSurvey(survey)} />
        </div>
      </div>
    {:else}
      <span class="flex max-width">Create or paste in a survey to get started!</span>
    {/each}
  {/if}
</div>

<footer class="flex spaced space-between bg extend-bg extend-down">
  {#if $currentSurveyName}
    <IconButton on:click={() => {}} icon="plus" text="New entry" />
    <div>
      <IconButton icon="copy" title="Copy survey" on:click={() => copySurvey($surveys[$currentSurveyIndex])} />
      <IconButton icon="download" title="Download entries" />
    </div>
  {:else}
    <IconButton icon="plus" text="New survey" on:click={newSurvey} />
    <div class="flex">
      <IconButton icon="paste" text="New from JSON" on:click={pasteSurvey} />
    </div>
  {/if}
</footer>
