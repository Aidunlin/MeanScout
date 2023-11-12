<script lang="ts">
  import type { DialogDataType, Entry, IDBRecord, Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  let entryCount = 0;

  const countRequest = idb.transaction("entries").objectStore("entries").index("surveyId").count(surveyRecord.id);
  countRequest.onsuccess = () => {
    if (typeof countRequest.result == "number") {
      entryCount = countRequest.result;
    }
  };

  let deleteSurveyDialog: DialogDataType<{ error: string }> = { data: { error: "" } };

  let teamInput = "";

  function addTeam() {
    if (teamInput.trim() && !surveyRecord.teams.includes(teamInput.trim())) {
      surveyRecord.teams = [...surveyRecord.teams, teamInput.trim()];
      teamInput = "";
    }
  }

  function sortTeams(teams: string[]) {
    return teams.toSorted((a, b) => a.localeCompare(b, "en", { numeric: true }));
  }

  function deleteTeam(team: string) {
    surveyRecord.teams = surveyRecord.teams.filter((t) => t.trim() != team.trim());
  }

  function hasMigratableEntries() {
    const survey = surveyRecord as IDBRecord<Survey> & { entries?: Entry[] };
    return Array.isArray(survey.entries);
  }

  function migrateEntries() {
    const survey = surveyRecord as IDBRecord<Survey> & { entries?: Entry[] };

    if (!Array.isArray(survey.entries)) {
      return;
    }

    const addTransaction = idb.transaction("entries", "readwrite");
    const entryStore = addTransaction.objectStore("entries");

    for (const entry of survey.entries) {
      entry.surveyId = surveyRecord.id;
      entryStore.add(entry);
    }

    addTransaction.oncomplete = () => {
      delete survey.entries;
      surveyRecord = survey;
    };
  }

  function deleteSurvey() {
    const deleteTransaction = idb.transaction(["surveys", "entries"], "readwrite");
    const surveyStore = deleteTransaction.objectStore("surveys");
    const entryStore = deleteTransaction.objectStore("entries");

    deleteTransaction.onerror = () => {
      deleteSurveyDialog.data.error = `Could not delete survey: ${deleteTransaction.error?.message}`;
    };

    const cursorRequest = entryStore.index("surveyId").openCursor(surveyRecord.id);
    cursorRequest.onerror = () => {
      deleteSurveyDialog.data.error = `Could not delete survey's entries: ${cursorRequest.error?.message}`;
    };

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor === undefined) {
        deleteSurveyDialog.data.error = "Could not delete survey's entries";
        return;
      }

      if (cursor === null) {
        const surveyRequest = surveyStore.delete(surveyRecord.id);
        surveyRequest.onerror = () => {
          deleteSurveyDialog.data.error = `Could not delete survey: ${surveyRequest.error?.message}`;
        };

        surveyRequest.onsuccess = () => {
          location.hash = "/main/surveys";
        };
        return;
      }

      cursor.delete();
      cursor.continue();
    };
  }
</script>

<Container column padding>
  <h2>Team Allowlist</h2>
  <Container column>
    <Container column noGap>
      Add team
      <input style="width:200px" bind:value={teamInput} on:keydown={(e) => e.key == "Enter" && addTeam()} />
    </Container>
    {#if surveyRecord.teams.length}
      <Container>
        {#each sortTeams(surveyRecord.teams) as team}
          <Button text={team} title="Delete {team}" on:click={() => deleteTeam(team)} />
        {/each}
      </Container>
    {:else}
      <span>{surveyRecord.teams.length ? "Teams" : "No teams added"}</span>
    {/if}
  </Container>

  {#if hasMigratableEntries()}
    <h2>Entry Migrator</h2>
    <Container>
      <Button iconName="right-from-bracket" text="Migrate" on:click={migrateEntries} />
    </Container>
  {/if}

  <h2>Options</h2>
  <Container>
    <Container column noGap>
      Change name
      <input bind:value={surveyRecord.name} />
    </Container>
  </Container>

  <h2>Danger Zone</h2>
  <Container>
    <Dialog
      bind:this={deleteSurveyDialog.dialog}
      openButton={{ iconName: "trash", text: "Delete survey" }}
      onConfirm={deleteSurvey}
      on:close={() => (deleteSurveyDialog.data = { error: "" })}
    >
      <span>Delete "{surveyRecord.name}"?</span>
      {#if entryCount}
        <span>{entryCount} {entryCount > 1 ? "entries" : "entry"} will be lost!</span>
      {/if}
      {#if deleteSurveyDialog.data.error}
        <span>{deleteSurveyDialog.data.error}</span>
      {/if}
    </Dialog>
  </Container>
</Container>
