<script lang="ts">
  import { flattenFields, getDefaultFieldValue, type Entry, type IDBRecord, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { targetStore } from "$lib/target";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let draftRecords: IDBRecord<Entry>[] = [];
  let entryRecords: IDBRecord<Entry>[] = [];

  const cursorTransaction = idb.transaction(["drafts", "entries"]);

  const draftCursorRequest = cursorTransaction.objectStore("drafts").index("surveyId").openCursor(surveyRecord.id);
  draftCursorRequest.onsuccess = () => {
    const cursor = draftCursorRequest.result;
    if (cursor) {
      draftRecords = [...draftRecords, cursor.value];
      cursor.continue();
    }
  };

  const entryCursorRequest = cursorTransaction.objectStore("entries").index("surveyId").openCursor(surveyRecord.id);
  entryCursorRequest.onsuccess = () => {
    const cursor = entryCursorRequest.result;
    if (cursor) {
      entryRecords = [...entryRecords, cursor.value];
      cursor.continue();
    }
  };

  const flattenedFields = flattenFields(surveyRecord.fields);
  const importantFields = flattenedFields.filter((field) => field.type == "team" || field.type == "match");

  function newDraftClicked() {
    let matchValue = 1;
    const matchFieldIndex = flattenedFields.findIndex((field) => field.type == "match");
    const allRecords = [...draftRecords, ...entryRecords];
    if (matchFieldIndex != -1 && allRecords.length) {
      matchValue = Math.max(...allRecords.map((entry) => entry.values[matchFieldIndex] ?? 0)) + 1;
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

    const addRequest = idb.transaction("drafts", "readwrite").objectStore("drafts").add(draft);
    addRequest.onsuccess = () => {
      surveyRecord.modified = new Date();
      const id = addRequest.result as number | undefined;
      if (id == undefined) return;

      location.hash = `/draft/${id}`;
    };
  }
</script>

<Header current={{ text: surveyRecord.name, iconName: "list-ul" }} />

<Container direction="column" padding="large">
  <Button title="New draft" on:click={newDraftClicked}>
    <Container maxWidth>
      <Icon name="plus" />
      New draft
    </Container>
  </Button>
</Container>

{#if draftRecords.length}
  <Container direction="column" padding="large">
    <h2>Drafts</h2>
    {#each draftRecords.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as draft (draft.id)}
      <Anchor hash="draft/{draft.id}" title="Edit draft">
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
