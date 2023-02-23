<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/Button.svelte";
  import Container from "$lib/Container.svelte";
  import Header from "$lib/Header.svelte";
  import { location, locations, surveys } from "$lib/stores";
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

<Header />

<Container padding>
  <Container column noGap>
    Location
    <select bind:value={$location} title="Location">
      {#each Object.values(locations) as location}
        <option>{location}</option>
      {/each}
    </select>
  </Container>
</Container>

<Container column padding>
  <h2>Surveys</h2>
  {#each $surveys as survey, surveyIndex (survey)}
    <Container spaceBetween>
      <Container>
        <Button iconName="pen" title="Edit survey" on:click={() => editSurveyClicked(surveyIndex)} />
        <span>{survey.name}</span>
      </Container>
      <Button iconName="trash" on:click={() => deleteSurveyClicked(surveyIndex)} />
    </Container>
  {/each}
</Container>

<footer>
  <Button iconName="plus" title="New survey" on:click={newSurveyClicked} />
  <Button iconName="paste" title="New from JSON" on:click={pasteSurveyClicked} />
</footer>
