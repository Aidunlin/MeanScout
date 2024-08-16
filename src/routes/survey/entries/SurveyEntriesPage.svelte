<script lang="ts">
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Entry } from "$lib/entry";
  import { modeStore } from "$lib/settings";
  import type { Survey } from "$lib/survey";
  import BulkSetEntryStatusDialog from "./BulkSetEntryStatusDialog.svelte";
  import ExportEntriesDialog from "./ExportEntriesDialog.svelte";
  import ImportEntriesDialog from "./ImportEntriesDialog.svelte";
  import ImportEntryDialog from "./ImportEntryDialog.svelte";

  let {
    idb,
    surveyRecord,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<Survey>;
  } = $props();

  $effect(() => {
    idb.transaction("surveys", "readwrite").objectStore("surveys").put($state.snapshot(surveyRecord));
  });

  let submittedEntries = $state<IDBRecord<Entry>[]>([]);
  let exportedEntries = $state<IDBRecord<Entry>[]>([]);
  let show = $state(false);

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
      onset={() => {
        exportedEntries = [...exportedEntries, ...submittedEntries];
        submittedEntries = [];
      }}
    />
    {#each submittedEntries.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as entry (entry.id)}
      <Anchor route="entry/{entry.id}">
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
      onset={() => {
        submittedEntries = [...submittedEntries, ...exportedEntries];
        exportedEntries = [];
      }}
    />
    {#each exportedEntries.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as entry (entry.id)}
      <Anchor route="entry/{entry.id}">
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
