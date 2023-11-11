<script lang="ts">
  import { metricTypes, type DialogDataType, type IDBRecord, type MetricConfig, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";

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

  let deleteSurveyDialog: { element?: HTMLDialogElement; error: string } = { error: "" };

  function newSurvey() {
    const name = newSurveyDialog.data.name.trim();
    if (!name) {
      newSurveyDialog.data.error = "Name can't be blank!";
      return;
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
    survey.configs = Array.isArray(survey.configs) ? parseConfigs(survey.configs) : [];
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

  function deleteSurvey(id: number) {
    const deleteTransaction = idb.transaction(["surveys", "entries"], "readwrite");
    const surveyStore = deleteTransaction.objectStore("surveys");
    const entryStore = deleteTransaction.objectStore("entries");

    const cursorRequest = entryStore.index("surveyId").openCursor(id);
    cursorRequest.onerror = () => {
      deleteSurveyDialog.error = `Could not delete survey's entries: ${cursorRequest.error?.message}`;
    };

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor === undefined) {
        deleteSurveyDialog.error = "Could not delete survey's entries";
        return;
      }

      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        const surveyRequest = surveyStore.delete(id);
        surveyRequest.onerror = () => {
          deleteSurveyDialog.error = `Could not delete survey: ${surveyRequest.error?.message}`;
        };

        surveyRequest.onsuccess = () => {
          surveyRecords = surveyRecords.filter((survey) => survey.id !== id);
          deleteSurveyDialog.element?.close();
        };
      }
    };
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
      <Dialog
        openButton={{ iconName: "trash", title: "Delete entry" }}
        onOpen={(element) => (deleteSurveyDialog = { element, error: "" })}
        onConfirm={() => deleteSurvey(survey.id)}
        on:close={() => (deleteSurveyDialog = { error: "" })}
      >
        <span>Delete "{survey.name}"?</span>
        {#if deleteSurveyDialog.error}
          <span>{deleteSurveyDialog.error}</span>
        {/if}
      </Dialog>
    </Container>
  {/each}
</Container>

<footer>
  <Dialog
    bind:this={newSurveyDialog.dialog}
    openButton={{ iconName: "plus", text: "Survey", title: "New survey" }}
    onConfirm={newSurvey}
    on:close={() => (newSurveyDialog.data = { name: "", error: "" })}
  >
    <span>Enter name for new survey:</span>
    <input bind:value={newSurveyDialog.data.name} />
    {#if newSurveyDialog.data.error}
      <span>{newSurveyDialog.data.error}</span>
    {/if}
  </Dialog>
  <Dialog
    bind:this={pasteSurveyDialog.dialog}
    openButton={{ iconName: "paste", text: "Import", title: "Import survey" }}
    onConfirm={parseSurvey}
    on:close={() => (pasteSurveyDialog.data = { input: "", error: "" })}
  >
    <span>Paste new survey:</span>
    <textarea bind:value={pasteSurveyDialog.data.input} />
    {#if pasteSurveyDialog.data.error}
      <span>Could not import survey!</span>
      <span>{pasteSurveyDialog.data.error}</span>
    {/if}
  </Dialog>
</footer>
