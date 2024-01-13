<script lang="ts">
  import { type DialogDataType, type Entry, type IDBRecord, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Header from "$lib/components/Header.svelte";
  import { targetStore } from "$lib/target";

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

  function valueAsCSV(value: any) {
    return value.toString().replaceAll(",", "").replaceAll("\n", ". ").trim();
  }

  function entriesAsCSV() {
    return entryRecords.map((entry) => entry.values.map(valueAsCSV).join(",")).join("\n");
  }

  function surveyAsJSON() {
    const survey = structuredClone(surveyRecord) as Survey & { id?: number };
    delete survey.id;
    return JSON.stringify(survey, undefined, "  ");
  }

  function download(data: string, name: string, type: string) {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.download = name.replaceAll(" ", "_");
    anchor.href = url;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function share(data: string, name: string, type: string) {
    const file = new File([data], name.replaceAll(" ", "_"), { type });
    navigator.share({ files: [file], title: file.name });
  }

  function downloadEntries() {
    download(entriesAsCSV(), `${surveyRecord.name}-entries-${$targetStore}.csv`, "text/csv");
  }

  function shareEntries() {
    share(entriesAsCSV(), `${surveyRecord.name}-entries-${$targetStore}.csv`, "text/csv");
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
      location.hash = "/surveys";
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

<Container column padding>
  <h2>Entries</h2>
  <Container>
    <Button title="Download entries" on:click={downloadEntries}>
      <Icon name="download" />
      Download
    </Button>
    {#if "canShare" in navigator}
      <Button title="Share entries" on:click={shareEntries}>
        <Icon name="share-from-square" />
        Share
      </Button>
    {/if}
  </Container>

  <h2>Survey</h2>
  <Container>
    <Button title="Download survey" on:click={downloadSurvey}>
      <Icon name="download" />
      Download
    </Button>
    {#if "canShare" in navigator}
      <Button title="Share survey" on:click={shareSurvey}>
        <Icon name="share-from-square" />
        Share
      </Button>
    {/if}
  </Container>

  <h2>Team Allowlist</h2>
  <Container column>
    <Container column noGap>
      Add team
      <input style="width:200px" bind:value={teamInput} on:keydown={(e) => e.key == "Enter" && addTeam()} />
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
    <Container column noGap>
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
        Survey
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
