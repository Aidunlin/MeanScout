<script lang="ts">
  import { flattenFields, getDefaultFieldValue, type Entry, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { modeStore, targetStore } from "$lib/settings";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let draftRecords: IDBRecord<Entry>[] = [];
  let entryRecords: IDBRecord<Entry>[] = [];

  const cursorTransaction = idb.transaction("entries");

  const entryCursorRequest = cursorTransaction.objectStore("entries").index("surveyId").openCursor(surveyRecord.id);
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

  const flattenedFields = flattenFields(surveyRecord.fields);
  const importantFields = flattenedFields.filter((field) => field.type == "team" || field.type == "match");

  function newEntryClicked() {
    let matchValue = 1;
    const matchFieldIndex = flattenedFields.findIndex((field) => field.type == "match");
    if (matchFieldIndex != -1 && entryRecords.length) {
      matchValue = Math.max(...entryRecords.map((entry) => entry.values[matchFieldIndex] ?? 0)) + 1;
    }

    let teamValue = "";
    if (surveyRecord.matches.length) {
      let match = surveyRecord.matches.find((m) => m.number == matchValue);
      if (match) {
        switch ($targetStore) {
          case "red 1":
            teamValue = match.red1;
            break;
          case "red 2":
            teamValue = match.red2;
            break;
          case "red 3":
            teamValue = match.red3;
            break;
          case "blue 1":
            teamValue = match.blue1;
            break;
          case "blue 2":
            teamValue = match.blue2;
            break;
          case "blue 3":
            teamValue = match.blue3;
            break;
        }
      }
    }

    const draft: Entry = {
      surveyId: surveyRecord.id,
      status: "draft",
      values: flattenedFields.map((field, i) => {
        switch (field.type) {
          case "team":
            return teamValue;
          case "match":
            return matchValue;
          case "select":
            return field.values[0];
          default:
            return getDefaultFieldValue(field);
        }
      }),
      created: new Date(),
      modified: new Date(),
    };

    const addRequest = idb.transaction("entries", "readwrite").objectStore("entries").add(draft);
    addRequest.onsuccess = () => {
      const id = addRequest.result;
      if (id == undefined) return;

      surveyRecord.modified = new Date();
      location.hash = `/entry/${id}`;
    };
  }
</script>

<Header backLink="" title={surveyRecord.name} iconName="list-ul" />

<Container direction="column" padding="large">
  <Button title="New entry" on:click={newEntryClicked}>
    <Container maxWidth>
      <Icon name="plus" />
      New entry
    </Container>
  </Button>
</Container>

{#if draftRecords.length}
  <Container direction="column" padding="large">
    <h2>Drafts</h2>
    {#each draftRecords.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as draft (draft.id)}
      <Anchor hash="entry/{draft.id}" title="Edit draft">
        <Container align="center" maxWidth spaceBetween>
          <Container direction="column" gap="small">
            {#each importantFields as field, i}
              <span>{field.name}: {draft.values[i]}</span>
            {/each}
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
    <Anchor hash="survey/{surveyRecord.id}/matches">
      <Container maxWidth spaceBetween>
        <Container>
          <Icon name="table-list" />
          Matches
        </Container>
        <Icon name="arrow-right" />
      </Container>
    </Anchor>
    <Anchor hash="survey/{surveyRecord.id}/teams">
      <Container maxWidth spaceBetween>
        <Container>
          <Icon name="people-group" />
          Teams
        </Container>
        <Icon name="arrow-right" />
      </Container>
    </Anchor>
  {/if}
  <Anchor hash="survey/{surveyRecord.id}/options">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="gears" />
        Options
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
</Container>
