<script lang="ts">
  import { flattenFields, type Entry, type IDBRecord, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import { targetStore } from "$lib/target";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

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

  function valueToCSV(value: any) {
    return `${value}`.replaceAll(",", "").replaceAll("\n", ". ").trim();
  }

  function downloadEntries() {
    const csv = [
      flattenFields(surveyRecord.fields)
        .map((field) => field.name)
        .join(","),
      ...entryRecords.map((entry) => entry.values.map(valueToCSV).join(",")),
    ].join("\n");

    const anchor = document.createElement("a");
    anchor.download = `${surveyRecord.name}-${$targetStore}.csv`.replaceAll(" ", "_");
    anchor.href = `data:text/plain;charset=utf-8,${encodeURIComponent(csv)}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

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

<Container column padding>
  <h2>Entries</h2>
  {#each entryRecords as entry (entry.id)}
    <Container spaceBetween>
      <Container>
        <Anchor hash="entry/{entry.id}" iconName="arrow-right" title="View entry" />
        {#each flattenFields(surveyRecord.fields).slice(0, 2) as field, i}
          <span>{field.name}: {entry.values[i]}, </span>
        {/each}
        ...
      </Container>

      <Dialog
        openButton={{ iconName: "trash", title: "Delete entry" }}
        onOpen={(element) => (deleteEntryDialog = { element, error: "" })}
        onConfirm={() => deleteEntry(entry.id)}
        on:close={() => (deleteEntryDialog = { error: "" })}
      >
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

<footer>
  <Button iconName="download" text="Download" title="Download entries" on:click={downloadEntries} />
</footer>
