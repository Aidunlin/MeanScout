<script lang="ts">
  import { type Entry, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import NewEntryDialog from "$lib/dialogs/entry/NewEntryDialog.svelte";
  import { modeStore } from "$lib/settings";

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

  let entryRecords = $state<IDBRecord<Entry>[]>([]);
  let draftEntries = $state<IDBRecord<Entry>[]>([]);
  let show = $state(false);

  const entriesRequest = idb.transaction("entries").objectStore("entries").index("surveyId").getAll(surveyRecord.id);
  entriesRequest.onerror = () => (show = true);

  entriesRequest.onsuccess = () => {
    const entries = entriesRequest.result;
    if (!entries) return;

    entryRecords = entries;
    draftEntries = entries.filter((entry) => entry.status == "draft");

    show = true;
  };
</script>

<Header backLink="" title={surveyRecord.name} iconName="list-ul" />

<Container direction="column" padding="large">
  <NewEntryDialog {idb} bind:surveyRecord {entryRecords} />
</Container>

{#if show && draftEntries.length}
  <Container direction="column" padding="large">
    <h2>Drafts</h2>
    {#each draftEntries.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as draft (draft.id)}
      <Anchor route="entry/{draft.id}">
        <Container align="center" maxWidth spaceBetween>
          <Container direction="column" gap="small">
            <span>Team: {draft.team}</span>
            {#if draft.type == "match"}
              <span>Match: {draft.match}</span>
            {/if}
          </Container>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/each}
  </Container>
{/if}

<Container direction="column" padding="large">
  <h2>Survey</h2>
  <Anchor route="survey/{surveyRecord.id}/entries">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="list-ol" />
        Entries
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
  {#if surveyRecord.type == "match"}
    <Anchor route="survey/{surveyRecord.id}/analysis">
      <Container maxWidth spaceBetween>
        <Container>
          <Icon name="chart-simple" />
          Analysis
        </Container>
        <Icon name="arrow-right" />
      </Container>
    </Anchor>
  {/if}
  {#if $modeStore == "admin"}
    <Anchor route="survey/{surveyRecord.id}/fields">
      <Container maxWidth spaceBetween>
        <Container>
          <Icon name="list-check" />
          Fields
        </Container>
        <Icon name="arrow-right" />
      </Container>
    </Anchor>
    {#if surveyRecord.type == "match"}
      <Anchor route="survey/{surveyRecord.id}/matches">
        <Container maxWidth spaceBetween>
          <Container>
            <Icon name="table-list" />
            Matches
          </Container>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/if}
    <Anchor route="survey/{surveyRecord.id}/teams">
      <Container maxWidth spaceBetween>
        <Container>
          <Icon name="people-group" />
          Teams
        </Container>
        <Icon name="arrow-right" />
      </Container>
    </Anchor>
    <Anchor route="survey/{surveyRecord.id}/options">
      <Container maxWidth spaceBetween>
        <Container>
          <Icon name="gears" />
          Options
        </Container>
        <Icon name="arrow-right" />
      </Container>
    </Anchor>
  {/if}
</Container>
