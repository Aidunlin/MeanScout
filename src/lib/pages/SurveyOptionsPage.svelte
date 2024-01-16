<script lang="ts">
  import { download, share, type DialogDataType, type Entry, type IDBRecord, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { fetchTBA, tbaKeyStore } from "$lib/tba";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let entryCount = 0;

  const countTransaction = idb.transaction(["drafts", "entries"]);

  const draftCountRequest = countTransaction.objectStore("drafts").index("surveyId").count(surveyRecord.id);
  draftCountRequest.onsuccess = () => {
    if (typeof draftCountRequest.result == "number") {
      entryCount += draftCountRequest.result;
    }
  };

  const entryCountRequest = countTransaction.objectStore("entries").index("surveyId").count(surveyRecord.id);
  entryCountRequest.onsuccess = () => {
    if (typeof entryCountRequest.result == "number") {
      entryCount += entryCountRequest.result;
    }
  };

  let entryRecords: IDBRecord<Entry>[] = [];

  const entryCursorRequest = idb
    .transaction("entries")
    .objectStore("entries")
    .index("surveyId")
    .openCursor(surveyRecord.id);
  entryCursorRequest.onsuccess = () => {
    const cursor = entryCursorRequest.result;
    if (cursor) {
      entryRecords = [...entryRecords, cursor.value];
      cursor.continue();
    }
  };

  let deleteSurveyDialog: DialogDataType<{ error: string }> = { data: { error: "" } };

  let eventInput = "";
  let getTeamsOutput = "";

  let teamInput = "";

  async function getTeamsFromEvent() {
    getTeamsOutput = "Loading...";

    if (!navigator.onLine) {
      getTeamsOutput = "Error: offline";
      return;
    }

    let response = await fetchTBA(`/event/${eventInput.trim()}/teams/keys`, $tbaKeyStore);

    if (response.status == "success" && Array.isArray(response.data)) {
      surveyRecord.teams = response.data.map((team) => `${team}`.replace("frc", ""));
      getTeamsOutput = "Success";
    } else if (response.status == "not found") {
      getTeamsOutput = "Error: could not find event";
    } else {
      getTeamsOutput = "Error";
    }
  }

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

  function surveyAsJSON() {
    const survey = structuredClone(surveyRecord) as Survey & { id?: number };
    delete survey.id;
    return JSON.stringify(survey, undefined, "  ");
  }

  function downloadSurvey() {
    download(surveyAsJSON(), `${surveyRecord.name}-survey.json`, "application/json");
  }

  function shareSurvey() {
    // Web Share API does not allow JSON files.
    // https://docs.google.com/document/d/1tKPkHA5nnJtmh2TgqWmGSREUzXgMUFDL6yMdVZHqUsg
    share(surveyAsJSON(), `${surveyRecord.name}-survey.txt`, "text/plain");
  }

  function deleteEntries(transaction: IDBTransaction, storeName: string) {
    const cursorRequest = transaction.objectStore(storeName).index("surveyId").openCursor(surveyRecord.id);
    cursorRequest.onerror = () => {
      deleteSurveyDialog.data.error = `Could not delete survey's ${storeName}: ${cursorRequest.error?.message}`;
      transaction.abort();
    };

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor === undefined) {
        deleteSurveyDialog.data.error = `Could not delete survey's ${storeName}`;
        transaction.abort();
      }

      if (cursor === null) {
        return;
      }

      cursor.delete();
      cursor.continue();
    };
  }

  function deleteSurvey() {
    const deleteTransaction = idb.transaction(["surveys", "drafts", "entries"], "readwrite");
    deleteTransaction.onabort = () => {
      deleteSurveyDialog.data.error ||= `Could not delete survey: ${deleteTransaction.error?.message}`;
    };

    deleteTransaction.oncomplete = () => {
      location.hash = "/";
    };

    const surveyRequest = deleteTransaction.objectStore("surveys").delete(surveyRecord.id);
    surveyRequest.onerror = () => {
      deleteSurveyDialog.data.error = `Could not delete survey: ${surveyRequest.error?.message}`;
      deleteTransaction.abort();
    };

    deleteEntries(deleteTransaction, "drafts");
    deleteEntries(deleteTransaction, "entries");
  }
</script>

<Header
  parent={{ text: surveyRecord.name, iconName: "list-ul", hash: `survey/${surveyRecord.id}` }}
  current={{ text: "Options", iconName: "gears" }}
/>

<Container direction="column" padding="large">
  <Button title="Download survey" on:click={downloadSurvey}>
    <Container maxWidth>
      <Icon name="download" />
      Download survey
    </Container>
  </Button>
  {#if "canShare" in navigator}
    <Button title="Share survey" on:click={shareSurvey}>
      <Container maxWidth>
        <Icon name="share-from-square" />
        Share survey
      </Container>
    </Button>
  {/if}

  <h2>Team Allowlist</h2>
  <Container direction="column">
    {#if navigator.onLine && $tbaKeyStore}
      <Container direction="column" gap="none">
        Get teams from TBA Event
        <Container align="center">
          <input
            style="width:200px"
            bind:value={eventInput}
            on:keydown={(e) => e.key == "Enter" && getTeamsFromEvent()}
          />
          <Button disabled={!eventInput.trim().length || getTeamsOutput == "Loading..."} on:click={getTeamsFromEvent}>
            <Icon name="cloud-arrow-down" />
            Get
          </Button>
          {#if getTeamsOutput}
            <span>{getTeamsOutput}</span>
          {/if}
        </Container>
      </Container>
    {/if}
    <Container direction="column" gap="none">
      Add team
      <Container>
        <input style="width:200px" bind:value={teamInput} on:keydown={(e) => e.key == "Enter" && addTeam()} />
        <Button disabled={!teamInput.trim().length || surveyRecord.teams.includes(teamInput.trim())} on:click={addTeam}>
          <Icon name="plus" />
          Add
        </Button>
      </Container>
    </Container>
    {#if surveyRecord.teams.length}
      <Container>
        {#each sortTeams(surveyRecord.teams) as team}
          <Button title="Delete {team}" on:click={() => deleteTeam(team)}>{team}</Button>
        {/each}
      </Container>
    {:else}
      <span>{surveyRecord.teams.length ? "Teams" : "No teams added"}</span>
    {/if}
  </Container>

  <h2>Options</h2>
  <Container>
    <Container direction="column" gap="none">
      Change name
      <input bind:value={surveyRecord.name} />
    </Container>
  </Container>

  <h2>Danger Zone</h2>
  <Container>
    <Dialog
      bind:this={deleteSurveyDialog.dialog}
      onConfirm={deleteSurvey}
      on:close={() => (deleteSurveyDialog.data = { error: "" })}
    >
      <Button slot="opener" let:open on:click={open}>
        <Icon name="trash" />
        Delete survey
      </Button>

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
