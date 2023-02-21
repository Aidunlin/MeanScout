<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/Button.svelte";
  import Header from "$lib/Header.svelte";
  import { surveys } from "$lib/stores";
  import { parseSurvey, type Survey } from "$lib/surveys";

  function editSurveyClicked(surveyIndex: number) {
    goto(`/${surveyIndex}`);
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
  }

  function pasteSurveyClicked() {
    const surveyString = prompt("Paste new survey:");
    if (!surveyString) return;

    let result = parseSurvey(surveyString);

    if (typeof result == "string") {
      alert(`Could not set survey! ${result}`);
      return;
    }

    if ($surveys.map((survey) => survey.name).includes(result.name)) {
      alert(`Could not set survey! ${result.name} already exists`);
      return;
    }

    $surveys = [result, ...$surveys];
  }

  function deleteSurveyClicked(surveyIndex: number) {
    if (!confirm("Confirm delete?")) return;

    $surveys = $surveys.filter((_, idx) => idx != surveyIndex);
  }
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<Header />

<div class="flex spaced">
  <h2>Surveys</h2>
  {#each $surveys as survey, surveyIndex (survey)}
    <div class="flex spaced-inner space-between max-width">
      <div class="flex spaced-inner">
        <Button icon="pen" title="Edit survey" on:click={() => editSurveyClicked(surveyIndex)} />
        <span>{survey.name}</span>
      </div>
      <Button icon="delete" title="Delete survey" on:click={() => deleteSurveyClicked(surveyIndex)} />
    </div>
  {/each}
</div>

<footer>
  <Button icon="plus" title="New survey" on:click={newSurveyClicked} />
  <Button icon="paste" title="New from JSON" on:click={pasteSurveyClicked} />
</footer>
