<script lang="ts">
  import { EntryStore, SurveyStore, metricTypes, type IDBRecord, type Survey } from "$lib/app";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyStore: SurveyStore;
  export let surveyRecords: IDBRecord<Survey>[];
  export let entryStore: EntryStore;

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
        { name: "Team", type: "team" },
        { name: "Match", type: "match" },
        { name: "Absent", type: "toggle" },
      ],
      teams: [],
      created: new Date(),
      modified: new Date(),
    };

    surveyStore.add(survey).then((id) => {
      surveyRecords = [...surveyRecords, { id, ...survey }];
    });
  }

  function parseSurvey() {
    let survey: any;

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
          if (config.type == "group" && !Array.isArray(config.configs)) {
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

    surveyStore.add(survey).then((id) => {
      surveyRecords = [...surveyRecords, { id, ...survey }];
    });
  }

  function deleteSurvey(id: number) {
    surveyStore.delete(id).then(() => {
      surveyRecords = surveyRecords.filter((survey) => survey.id !== id);
      return entryStore.deleteAllWithSurveyId(id);
    });
  }
</script>

<Header />

<Container padding noGap>
  <Anchor hash="surveys" iconName="list-ul" title="Surveys" />
  <Anchor hash="options" iconName="ellipsis-vertical" title="Options" disableTheme />
</Container>

<Container column padding>
  <h2>Surveys</h2>
  {#each surveyRecords as survey (survey.id)}
    <Container spaceBetween>
      <Container>
        <Anchor hash="survey/{survey.id}/entries" iconName="pen" title="Edit survey" />
        <span>{survey.name}</span>
      </Container>
      <Dialog openButton={{ iconName: "trash", title: "Delete entry" }} onConfirm={() => deleteSurvey(survey.id)}>
        <span>Delete "{survey.name}"?</span>
      </Dialog>
    </Container>
  {/each}
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
