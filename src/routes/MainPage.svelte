<script lang="ts">
  import { indexes, location, locations, mainSubPage, parseSurvey, surveys, type Survey } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  let dialogNewSurvey = { name: "", error: "", visible: false };
  let dialogPasteSurvey = { input: "", error: "", visible: false };
  let dialogDeleteSurvey = { surveyIndex: 0, visible: false };

  function newSurvey() {
    if (!dialogNewSurvey.name) return;

    if ($surveys.map((survey) => survey.name).includes(dialogNewSurvey.name)) {
      dialogNewSurvey.error = "That name is already used!";
      return;
    }

    let survey: Survey = {
      name: dialogNewSurvey.name,
      configs: [],
      teams: [],
      entries: [],
    };
    $surveys = [survey, ...$surveys];

    dialogNewSurvey = { name: "", error: "", visible: false };
  }

  function pasteSurvey() {
    if (!dialogPasteSurvey.input) return;

    let result = parseSurvey(dialogPasteSurvey.input);

    if (typeof result == "string") {
      dialogPasteSurvey.error = `Could not set survey! ${result}`;
      return;
    }

    if ($surveys.map((survey) => survey.name).includes(result.name)) {
      dialogPasteSurvey.error = `Could not set survey! ${result.name} already exists`;
      return;
    }

    $surveys = [result, ...$surveys];

    dialogPasteSurvey = { input: "", error: "", visible: false };
  }

  function deleteSurvey() {
    $surveys = $surveys.filter((_, idx) => idx != dialogDeleteSurvey.surveyIndex);

    dialogDeleteSurvey = { surveyIndex: 0, visible: false };
  }
</script>

<Dialog title="Enter name for new survey:" bind:visible={dialogNewSurvey.visible}>
  <input bind:value={dialogNewSurvey.name} />
  {#if dialogNewSurvey.error}
    <span>{dialogNewSurvey.error}</span>
  {/if}
  <Button slot="buttons" iconName="check" title="Confirm" on:click={newSurvey} />
</Dialog>

<Dialog title="Paste new survey:" bind:visible={dialogPasteSurvey.visible}>
  <Container maxWidth>
    <textarea bind:value={dialogPasteSurvey.input} />
  </Container>
  {#if dialogPasteSurvey.error}
    <span>{dialogPasteSurvey.error}</span>
  {/if}
  <Button slot="buttons" iconName="check" title="Confirm" on:click={pasteSurvey} />
</Dialog>

<Dialog title="Delete this survey?" bind:visible={dialogDeleteSurvey.visible}>
  <span>Everything in "{$surveys[dialogDeleteSurvey.surveyIndex].name}" will be lost!</span>
  <Button slot="buttons" iconName="check" title="Confirm" on:click={deleteSurvey} />
</Dialog>

<Header />

<Container padding noGap>
  <Button
    iconName="list-ul"
    title="Surveys"
    disableTheme={$mainSubPage != "surveys"}
    on:click={() => ($mainSubPage = "surveys")}
  />
  <Button
    iconName="ellipsis-vertical"
    title="Options"
    disableTheme={$mainSubPage != "options"}
    on:click={() => ($mainSubPage = "options")}
  />
</Container>

{#if $mainSubPage == "surveys"}
  <Container column padding>
    <h2>Surveys</h2>
    {#each $surveys as survey, surveyIndex (survey)}
      <Container spaceBetween>
        <Container>
          <Button iconName="pen" title="Edit survey" on:click={() => ($indexes.survey = surveyIndex)} />
          <span>{survey.name}</span>
          {#if survey.entries.length}
            <span>({survey.entries.length} {survey.entries.length == 1 ? "entry" : "entries"})</span>
          {/if}
        </Container>
        <Button iconName="trash" on:click={() => (dialogDeleteSurvey = { surveyIndex, visible: true })} />
      </Container>
    {/each}
  </Container>

  <footer>
    <Button
      iconName="plus"
      title="New survey"
      on:click={() => (dialogNewSurvey = { name: "", error: "", visible: true })}
    />
    <Button
      iconName="paste"
      title="Paste survey"
      on:click={() => (dialogPasteSurvey = { input: "", error: "", visible: true })}
    />
  </footer>
{:else}
  <Container column padding>
    <h2>Options</h2>
    <Container>
      <Container column noGap>
        Location
        <select bind:value={$location} title="Location">
          {#each Object.values(locations) as location}
            <option>{location}</option>
          {/each}
        </select>
      </Container>
    </Container>
  </Container>
{/if}
