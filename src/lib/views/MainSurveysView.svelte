<script lang="ts">
  import { metricTypes, type MetricConfig, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import type { EntryStore, IDBRecord, SurveyStore } from "$lib/db";

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

  function parseName(name: any) {
    if (typeof name != "string" || !name.trim()) {
      const currentDate = new Date().toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
      return `Survey ${currentDate}`;
    }

    return name;
  }

  function parseConfigs(configs: any[]): MetricConfig[] {
    return configs.filter((config) => {
      if (typeof config != "object") {
        return false;
      }

      if (typeof config.name != "string" || !config.name.trim()) {
        return false;
      }

      if (!metricTypes.includes(config.type)) {
        return false;
      }

      if (config.type == "select" && !Array.isArray(config.values)) {
        return false;
      }

      if (config.type == "group" && !Array.isArray(config.configs)) {
        return false;
      }

      return true;
    });
  }

  function parseTeams(teams: any[]) {
    return teams
      .filter((team: any) => typeof team == "number" || typeof team == "string")
      .map((team: number | string) => team.toString());
  }

  function parseDate(date: any) {
    if (typeof date != "string" || Number.isNaN(Date.parse(date))) {
      return new Date(date);
    }

    return new Date();
  }

  function parseSurvey() {
    if (!pasteSurveyDialog.input.trim()) {
      return false;
    }

    let survey: any;

    try {
      survey = JSON.parse(pasteSurveyDialog.input.trim());
    } catch (e) {
      pasteSurveyDialog.error = "Invalid input";
      return false;
    }

    delete survey.id;
    survey.name = parseName(survey.name);
    survey.configs = Array.isArray(survey.configs) ? parseConfigs(survey.configs) : [];
    survey.teams = Array.isArray(survey.teams) ? parseTeams(survey.teams) : [];
    survey.created = parseDate(survey.created);
    survey.modified = parseDate(survey.modified);
    delete survey.entries;

    surveyStore.add(survey).then((id) => {
      surveyRecords = [...surveyRecords, { id, ...survey }];
    });
  }

  function deleteSurvey(id: number) {
    Promise.all([surveyStore.delete(id), entryStore.deleteAllWithSurveyId(id)]).then(() => {
      surveyRecords = surveyRecords.filter((survey) => survey.id !== id);
    });
  }
</script>

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
