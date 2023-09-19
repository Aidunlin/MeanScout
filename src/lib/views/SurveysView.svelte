<script lang="ts">
  import { metricTypes, type Survey, SurveyStore } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyStore: SurveyStore;

  let surveysPromise = surveyStore.getAll();

  function loadSurveys() {
    surveysPromise = surveyStore.getAll();
  }

  let newSurveyDialog = { name: "", error: "" };
  let pasteSurveyDialog: { input: string; errors: string[] } = { input: "", errors: [] };

  function newSurvey() {
    const name = newSurveyDialog.name.trim();
    if (!name) {
      newSurveyDialog.error = "Name can't be blank!";
      return false;
    }
    const survey: Survey = {
      name,
      configs: [
        { name: "Team", type: "team", required: true },
        { name: "Match", type: "match", required: true },
        { name: "Absent", type: "toggle", required: true },
      ],
      teams: [],
      entries: [],
      created: new Date(),
      modified: new Date(),
    };
    surveyStore.add(survey).then(loadSurveys);
  }

  function validateSurvey(survey: Survey) {
    let errors: string[] = [];
    if (!survey.name || !survey.name.trim()) {
      errors.push("Survey has no name");
    }
    if (survey.teams && !Array.isArray(survey.teams)) {
      errors.push("Survey has invalid teams");
    }
    if (!survey.configs) {
      errors.push("Survey has no configs");
    } else {
      survey.configs.forEach((config, i) => {
        if (!config.name || !config.name.trim()) {
          errors.push(`Config ${i + 1} has no name`);
        }
        if (config.type == "select" && !Array.isArray(config.values ?? [])) {
          errors.push(`Config ${config.name ?? i + 1} has invalid values`);
        }
        if (!metricTypes.includes(config.type)) {
          errors.push(`Config ${config.name ?? i + 1} has invalid type`);
        }
      });
    }
    return { errors };
  }

  function parseSurvey() {
    let survey: Survey;
    try {
      survey = JSON.parse(pasteSurveyDialog.input.trim()) as Survey;
    } catch (e) {
      pasteSurveyDialog.errors = ["Invalid input"];
      return false;
    }
    survey.id = undefined;
    survey.name ??= `Survey ${new Date().toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}`;
    survey.configs ??= [];
    survey.entries ??= [];
    survey.teams ??= [];
    survey.created ??= new Date();
    survey.modified ??= new Date();
    pasteSurveyDialog.errors = validateSurvey(survey).errors;
    if (pasteSurveyDialog.errors.length) return false;
    surveyStore.add(survey).then(loadSurveys);
  }

  function deleteSurvey(surveyId?: number) {
    if (surveyId == undefined) return;
    surveyStore.delete(surveyId).then(loadSurveys);
  }
</script>

<Header />

<Container padding noGap>
  <Button iconName="list-ul" title="Surveys" />
  <Button iconName="ellipsis-vertical" title="Options" disableTheme on:click={() => (location.hash = "/options")} />
</Container>

<Container column padding>
  <h2>Surveys</h2>
  {#await surveysPromise then surveys}
    {#each surveys as survey (survey.id)}
      <Container spaceBetween>
        <Container>
          <Button
            iconName="pen"
            title="Edit survey"
            on:click={() => (location.hash = `/survey/${survey.id}/entries`)}
          />
          <span>{survey.name}</span>
        </Container>
        <Dialog openButton={{ iconName: "trash", title: "Delete entry" }} onConfirm={() => deleteSurvey(survey.id)}>
          <span>Delete "{survey.name}"?</span>
          {#if survey.entries.length}
            <span>{survey.entries.length} {survey.entries.length == 1 ? "entry" : "entries"} will be lost!</span>
          {/if}
        </Dialog>
      </Container>
    {/each}
  {/await}
</Container>

<footer>
  <Dialog
    openButton={{ iconName: "plus", title: "New survey" }}
    onConfirm={newSurvey}
    on:close={() => (newSurveyDialog = { name: "", error: "" })}
  >
    <span>Enter name for new survey:</span>
    <input bind:value={newSurveyDialog.name} />
    {#if newSurveyDialog.error}
      <span>{newSurveyDialog.error}</span>
    {/if}
  </Dialog>
  <Dialog
    openButton={{ iconName: "paste", title: "Import survey" }}
    onConfirm={parseSurvey}
    on:close={() => (pasteSurveyDialog = { input: "", errors: [] })}
  >
    <span>Paste new survey:</span>
    <textarea bind:value={pasteSurveyDialog.input} />
    {#if pasteSurveyDialog.errors.length}
      <span>Could not import survey!</span>
      <ul>
        {#each pasteSurveyDialog.errors as error}
          <li>{error}</li>
        {/each}
      </ul>
    {/if}
  </Dialog>
</footer>
