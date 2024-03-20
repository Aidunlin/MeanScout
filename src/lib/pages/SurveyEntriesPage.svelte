<script lang="ts">
  import { download, flattenFields, share, type Entry, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import BulkSetEntryStatusDialog from "$lib/dialogs/BulkSetEntryStatusDialog.svelte";
  import { targetStore } from "$lib/settings";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let submittedEntries: IDBRecord<Entry>[] = [];
  let exportedEntries: IDBRecord<Entry>[] = [];

  const entryCursorRequest = idb
    .transaction("entries")
    .objectStore("entries")
    .index("surveyId")
    .openCursor(surveyRecord.id);
  entryCursorRequest.onsuccess = () => {
    const cursor = entryCursorRequest.result;
    if (cursor) {
      if (cursor.value.status == "submitted") {
        submittedEntries = [...submittedEntries, cursor.value];
      }
      if (cursor.value.status == "exported") {
        exportedEntries = [...exportedEntries, cursor.value];
      }
      cursor.continue();
    }
  };

  const importantFields = flattenFields(surveyRecord.fields).filter(
    (field) => field.type == "team" || field.type == "match",
  );

  function valueAsCSV(value: any) {
    return value.toString().replaceAll(",", "").replaceAll("\n", ". ").trim();
  }

  function entriesAsCSV() {
    return submittedEntries.map((entry) => entry.values.map(valueAsCSV).join(",")).join("\n");
  }

  function downloadEntries() {
    download(entriesAsCSV(), `${surveyRecord.name}-entries-${$targetStore}.csv`, "text/csv");
  }

  function shareEntries() {
    share(entriesAsCSV(), `${surveyRecord.name}-entries-${$targetStore}.csv`, "text/csv");
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Entries" iconName="list-ol" />

<Container direction="column" padding="large">
  {#if submittedEntries.length}
    <h2>Submitted Entries</h2>
    <Button title="Download entries" on:click={downloadEntries}>
      <Container maxWidth>
        <Icon name="download" />
        Download entries
      </Container>
    </Button>
    {#if "canShare" in navigator}
      <Button title="Share entries" on:click={shareEntries}>
        <Container maxWidth>
          <Icon name="share-from-square" />
          Share entries
        </Container>
      </Button>
    {/if}
    <BulkSetEntryStatusDialog
      {idb}
      {surveyRecord}
      from="submitted"
      to="exported"
      onSet={() => {
        exportedEntries = [...exportedEntries, ...submittedEntries];
        submittedEntries = [];
      }}
    />
    {#each submittedEntries.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as entry (entry.id)}
      <Anchor hash="entry/{entry.id}" title="Edit entry">
        <Container align="center" maxWidth spaceBetween>
          <Container direction="column" gap="small">
            {#each importantFields as field, i}
              <span>{field.name}: {entry.values[i]}</span>
            {/each}
          </Container>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/each}
  {/if}

  {#if exportedEntries.length}
    <h2>Exported Entries</h2>
    {#each exportedEntries.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as entry (entry.id)}
      <Anchor hash="entry/{entry.id}" title="Edit entry">
        <Container align="center" maxWidth spaceBetween>
          <Container direction="column" gap="small">
            {#each importantFields as field, i}
              <span>{field.name}: {entry.values[i]}</span>
            {/each}
          </Container>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/each}
    <BulkSetEntryStatusDialog
      {idb}
      {surveyRecord}
      from="exported"
      to="submitted"
      onSet={() => {
        submittedEntries = [...submittedEntries, ...exportedEntries];
        exportedEntries = [];
      }}
    />
  {/if}
</Container>
