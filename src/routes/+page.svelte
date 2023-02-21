<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/Button.svelte";
  import Header from "$lib/Header.svelte";
  import { surveys } from "$lib/stores";
  import { downloadSurveyEntries, parseSurvey, type Survey } from "$lib/surveys";

  function editSurveyClicked(i: number) {
    goto(`/${i}`);
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

    $surveys = $surveys.filter((_, idx) => idx != i);
  }
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<Header />

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

<footer>
  <Button icon="plus" title="New survey" on:click={newSurveyClicked} />
  <Button icon="paste" title="New from JSON" on:click={pasteSurveyClicked} />
</footer>
