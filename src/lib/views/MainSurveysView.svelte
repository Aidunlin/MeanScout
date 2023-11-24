<script lang="ts">
  import { fieldTypes, type DialogDataType, type Field, type IDBRecord, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;

  let surveyRecords: IDBRecord<Survey>[] = [];

  const cursorRequest = idb.transaction("surveys").objectStore("surveys").openCursor();
  cursorRequest.onsuccess = () => {
    const cursor = cursorRequest.result;
    if (cursor) {
      surveyRecords = [...surveyRecords, cursor.value];
      cursor.continue();
    }
  };

  let newSurveyDialog: DialogDataType<{ name: string; error: string }> = {
    data: { name: "", error: "" },
  };

  let pasteSurveyDialog: DialogDataType<{ input: string; error: string }> = {
    data: { input: "", error: "" },
  };

  function newSurvey() {
    const name = newSurveyDialog.data.name.trim();
    if (!name) {
      newSurveyDialog.data.error = "Name can't be blank!";
      return;
    }

    const survey: Survey = {
      name,
      fields: [
        { name: "Team", type: "team" },
        { name: "Match", type: "match" },
        { name: "Absent", type: "toggle" },
      ],
      teams: [],
      created: new Date(),
      modified: new Date(),
    };

    const addRequest = idb.transaction("surveys", "readwrite").objectStore("surveys").add(survey);
    addRequest.onerror = () => {
      newSurveyDialog.data.error = `Could not add survey: ${addRequest.error?.message}`;
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) {
        newSurveyDialog.data.error = "Could not add survey";
        return;
      }

      surveyRecords = [...surveyRecords, { id, ...survey }];
      newSurveyDialog.dialog?.close();
    };
  }

  function parseName(name: any) {
    if (typeof name != "string" || !name.trim()) {
      const currentDate = new Date().toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
      return `Survey ${currentDate}`;
    }

    return name;
  }

  function parseFields(fields: any[]): Field[] {
    return fields.filter((field) => {
      if (typeof field != "object") {
        return false;
      }

      if (typeof field.name != "string" || !field.name.trim()) {
        return false;
      }

      if (!fieldTypes.includes(field.type)) {
        return false;
      }

      if (field.type == "select" && !Array.isArray(field.values)) {
        return false;
      }

      if (field.type == "group" && !Array.isArray(field.fields)) {
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
    if (!pasteSurveyDialog.data.input.trim()) {
      pasteSurveyDialog.data.error = "Invalid input";
      return;
    }

    let survey: any;

    try {
      survey = JSON.parse(pasteSurveyDialog.data.input.trim());
    } catch (e) {
      pasteSurveyDialog.data.error = "Invalid input";
      return;
    }

    delete survey.id;
    survey.name = parseName(survey.name);
    survey.fields = Array.isArray(survey.fields) ? parseFields(survey.fields) : [];
    survey.teams = Array.isArray(survey.teams) ? parseTeams(survey.teams) : [];
    survey.created = parseDate(survey.created);
    survey.modified = parseDate(survey.modified);
    delete survey.entries;

    const addRequest = idb.transaction("surveys", "readwrite").objectStore("surveys").add(survey);
    addRequest.onerror = () => {
      pasteSurveyDialog.data.error = `Could not add survey: ${addRequest.error?.message}`;
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) {
        pasteSurveyDialog.data.error = "Could not add survey";
        return;
      }

      surveyRecords = [...surveyRecords, { id, ...survey }];
      pasteSurveyDialog.dialog?.close();
    };
  }
</script>

<Container column padding>
  <h2>Surveys</h2>
  {#each surveyRecords as survey (survey.id)}
    <Container>
      <Anchor hash="survey/{survey.id}/drafts" title="Open survey">
        <Icon name="arrow-right" />
      </Anchor>
      <span>{survey.name}</span>
    </Container>
  {/each}
</Container>

<footer>
  <Dialog
    bind:this={newSurveyDialog.dialog}
    onConfirm={newSurvey}
    on:close={() => (newSurveyDialog.data = { name: "", error: "" })}
  >
    <Button title="New survey" slot="opener" let:open on:click={open}>
      <Icon name="plus" />
      Survey
    </Button>

    <span>Enter name for new survey:</span>
    <input bind:value={newSurveyDialog.data.name} />
    {#if newSurveyDialog.data.error}
      <span>{newSurveyDialog.data.error}</span>
    {/if}
  </Dialog>

  <Dialog
    bind:this={pasteSurveyDialog.dialog}
    onConfirm={parseSurvey}
    on:close={() => (pasteSurveyDialog.data = { input: "", error: "" })}
  >
    <Button title="Import survey" slot="opener" let:open on:click={open}>
      <Icon name="paste" />
      Import
    </Button>

    <span>Paste new survey:</span>
    <textarea bind:value={pasteSurveyDialog.data.input} />
    {#if pasteSurveyDialog.data.error}
      <span>Could not import survey!</span>
      <span>{pasteSurveyDialog.data.error}</span>
    {/if}
  </Dialog>
</footer>
