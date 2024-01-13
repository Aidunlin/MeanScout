<script lang="ts">
  import { flattenFields, type Entry, type IDBRecord, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
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

<Container column padding>
  {#each entryRecords as entry (entry.id)}
    <Container spaceBetween>
      <Container>
        <Anchor hash="entry/{entry.id}" title="View entry">
          <Icon name="arrow-right" />
        </Anchor>
        {#each flattenFields(surveyRecord.fields).slice(0, 2) as field, i}
          <span>{field.name}: {entry.values[i]}, </span>
        {/each}
        ...
      </Container>

      <Dialog
        onOpen={(element) => (deleteEntryDialog = { element, error: "" })}
        onConfirm={() => deleteEntry(entry.id)}
        on:close={() => (deleteEntryDialog = { error: "" })}
      >
        <Button title="Delete entry" slot="opener" let:open on:click={open}>
          <Icon name="trash" />
        </Button>

        <span>Delete this entry?</span>
        {#each flattenFields(surveyRecord.fields).slice(0, 2) as field, i}
          <span>{field.name}: {entry.values[i]}</span>
        {/each}
        {#if deleteEntryDialog.error}
          <span>{deleteEntryDialog.error}</span>
        {/if}
      </Dialog>
    </Container>
  {/each}
</Container>
