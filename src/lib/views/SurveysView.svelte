<script lang="ts">
  import { SurveyStore, metricTypes, type Survey } from "$lib/app";
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
  let pasteSurveyDialog: { input: string; error: string } = { input: "", error: "" };

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

  function parseSurvey() {
    let survey;

    try {
      survey = JSON.parse(pasteSurveyDialog.input.trim(), (key, value) => {
        if (key == "created" || key == "modified") {
          if (Number.isNaN(Date.parse(value))) {
            return new Date();
          } else {
            return new Date(value);
          }
        }
        return value;
      });
    } catch (e) {
      pasteSurveyDialog.error = "Invalid input";
      return false;
    }

    delete survey.id;

    if (typeof survey.name != "string" || !survey.name.trim()) {
      const currentDate = new Date().toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
      survey.name = `Survey ${currentDate}`;
    }

    if (!Array.isArray(survey.configs)) {
      survey.configs = [];
    } else {
      survey.configs = (survey.configs as any[])
        .map((config, i) => {
          if (typeof config.name != "string" || !config.name.trim()) {
            config.name = `Config ${i + 1}`;
          }
          if (config.type == "select" && !Array.isArray(config.values)) {
            return undefined;
          }
          if (!metricTypes.includes(config.type)) {
            return undefined;
          }
          return config;
        })
        .filter((config) => config);
    }

    if (!Array.isArray(survey.teams)) {
      survey.teams = [];
    } else {
      survey.teams = survey.teams.map((team: any) => team.toString());
    }

    survey.entries = [];

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
    on:close={() => (pasteSurveyDialog = { input: "", error: "" })}
  >
    <span>Paste new survey:</span>
    <textarea bind:value={pasteSurveyDialog.input} />
    {#if pasteSurveyDialog.error}
      <span>Could not import survey!</span>
      <span>{pasteSurveyDialog.error}</span>
    {/if}
  </Dialog>
</footer>
