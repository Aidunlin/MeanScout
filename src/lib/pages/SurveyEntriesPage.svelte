<script lang="ts">
  import { flattenFields, type Entry, type IDBRecord, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

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

  let deleteEntryDialog: { element?: HTMLDialogElement; error: string } = { error: "" };

  function deleteEntry(id: number) {
    const deleteRequest = idb.transaction("entries", "readwrite").objectStore("entries").delete(id);
    deleteRequest.onerror = () => {
      deleteEntryDialog.error = `Could not delete entry: ${deleteRequest.error?.message}`;
    };

    deleteRequest.onsuccess = () => {
      entryRecords = entryRecords.filter((entry) => entry.id !== id);
      deleteEntryDialog.element?.close();
    };
  }
</script>

<Header
  parent={{ text: surveyRecord.name, iconName: "list-ul", hash: `survey/${surveyRecord.id}` }}
  current={{ text: "Entries", iconName: "list-ol" }}
/>

{#if entryRecords.length}
  <Container column padding>
    {#each entryRecords as entry (entry.id)}
      <Anchor hash="entry/{entry.id}" title="Edit entry">
        <Container maxWidth spaceBetween>
          <Container column>
            {#each flattenFields(surveyRecord.fields).filter((field) => {
              return field.type == "team" || field.type == "match";
            }) as field, i}
              <span>{field.name}: {entry.values[i]}</span>
            {/each}
          </Container>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/each}
  </Container>
{/if}
