<script lang="ts">
  import { type Entry, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import BulkSetEntryStatusDialog from "$lib/dialogs/entry/BulkSetEntryStatusDialog.svelte";
  import ExportEntriesDialog from "$lib/dialogs/entry/ExportEntriesDialog.svelte";
  import ImportEntriesDialog from "$lib/dialogs/entry/ImportEntriesDialog.svelte";
  import ImportEntryDialog from "$lib/dialogs/entry/ImportEntryDialog.svelte";
  import { modeStore } from "$lib/settings";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let submittedEntries: IDBRecord<Entry>[] = [];
  let exportedEntries: IDBRecord<Entry>[] = [];
  let show = false;

  const entriesRequest = idb.transaction("entries").objectStore("entries").index("surveyId").getAll(surveyRecord.id);
  entriesRequest.onerror = () => (show = true);

  entriesRequest.onsuccess = () => {
    const entries = entriesRequest.result;
    if (!entries) return;

    submittedEntries = entries.filter((entry) => entry.status == "submitted");
    exportedEntries = entries.filter((entry) => entry.status == "exported");

    show = true;
  };
</script>

<Header backLink="survey/{surveyRecord.id}" title="Entries" iconName="list-ol" />

<Container direction="column" padding="large">
  {#if $modeStore == "admin"}
    <ImportEntriesDialog {idb} {surveyRecord} />
    <ImportEntryDialog {idb} {surveyRecord} bind:exportedEntries />
  {/if}

  <h2>Submitted Entries</h2>
  {#if show && submittedEntries.length}
    <ExportEntriesDialog {surveyRecord} entries={submittedEntries} />
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
            <span>Team: {entry.team}</span>
            {#if entry.type == "match"}
              <span>Match: {entry.match}</span>
              {#if entry.absent}
                <strong>Absent: {entry.absent}</strong>
              {/if}
            {/if}
          </Container>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/each}
  {:else if show}
    <span>No entries.</span>
  {:else}
    <span>Loading...</span>
  {/if}

  <h2>Exported Entries</h2>
  {#if show && exportedEntries.length}
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
    {#each exportedEntries.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as entry (entry.id)}
      <Anchor hash="entry/{entry.id}" title="Edit entry">
        <Container align="center" maxWidth spaceBetween>
          <Container direction="column" gap="small">
            <span>Team: {entry.team}</span>
            {#if entry.type == "match"}
              <span>Match: {entry.match}</span>
              {#if entry.absent}
                <strong>Absent: {entry.absent}</strong>
              {/if}
            {/if}
          </Container>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/each}
  {:else if show}
    <span>No entries.</span>
  {:else}
    <span>Loading...</span>
  {/if}
</Container>
