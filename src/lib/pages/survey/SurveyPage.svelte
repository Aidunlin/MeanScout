<script lang="ts">
  import { type Entry, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import NewEntryDialog from "$lib/dialogs/entry/NewEntryDialog.svelte";
  import { modeStore } from "$lib/settings";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let draftRecords: IDBRecord<Entry>[] = [];
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
      if (cursor.value.status == "draft") {
        draftRecords = [...draftRecords, cursor.value];
      }
      cursor.continue();
    }
  };
</script>

<Header backLink="" title={surveyRecord.name} iconName="list-ul" />

<Container direction="column" padding="large">
  <NewEntryDialog {idb} bind:surveyRecord {entryRecords} />
</Container>

{#if draftRecords.length}
  <Container direction="column" padding="large">
    <h2>Drafts</h2>
    {#each draftRecords.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as draft (draft.id)}
      <Anchor hash="entry/{draft.id}" title="Edit draft">
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
  <Anchor hash="survey/{surveyRecord.id}/entries">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="list-ol" />
        Entries
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
  {#if surveyRecord.type == "match"}
    <Anchor hash="survey/{surveyRecord.id}/analysis">
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
    <Anchor hash="survey/{surveyRecord.id}/fields">
      <Container maxWidth spaceBetween>
        <Container>
          <Icon name="list-check" />
          Fields
        </Container>
        <Icon name="arrow-right" />
      </Container>
    </Anchor>
    {#if surveyRecord.type == "match"}
      <Anchor hash="survey/{surveyRecord.id}/matches">
        <Container maxWidth spaceBetween>
          <Container>
            <Icon name="table-list" />
            Matches
          </Container>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/if}
    <Anchor hash="survey/{surveyRecord.id}/teams">
      <Container maxWidth spaceBetween>
        <Container>
          <Icon name="people-group" />
          Teams
        </Container>
        <Icon name="arrow-right" />
      </Container>
    </Anchor>
    <Anchor hash="survey/{surveyRecord.id}/options">
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
