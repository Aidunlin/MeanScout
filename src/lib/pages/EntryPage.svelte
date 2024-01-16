<script lang="ts">
  import { flattenFields, type DialogDataType, type Entry, type IDBRecord, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryRecord: IDBRecord<Entry>;

  let editEntryDialog: DialogDataType<{ error: string }> = { data: { error: "" } };

  let deleteEntryDialog: { element?: HTMLDialogElement; error: string } = { error: "" };

  function editEntry() {
    const moveTransaction = idb.transaction(["drafts", "entries"], "readwrite");
    moveTransaction.onabort = () => {
      editEntryDialog.data.error ||= `Could not edit entry: ${moveTransaction.error?.message}`;
    };

    const deleteRequest = moveTransaction.objectStore("entries").delete(entryRecord.id);
    deleteRequest.onerror = () => {
      editEntryDialog.data.error = `Could not edit entry: ${deleteRequest.error?.message}`;
      moveTransaction.abort();
    };

    const draftRecord = structuredClone(entryRecord) as Entry & { id?: number };
    delete draftRecord.id;

    const addRequest = moveTransaction.objectStore("drafts").add(draftRecord);
    deleteRequest.onerror = () => {
      editEntryDialog.data.error = `Could not edit entry: ${deleteRequest.error?.message}`;
      moveTransaction.abort();
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) {
        moveTransaction.abort();
        editEntryDialog.data.error = "Could not edit entry: entry record id is undefined";
        return;
      }

      location.hash = `/draft/${id}`;
    };
  }

  function countPreviousFields(index: number) {
    return flattenFields(surveyRecord.fields.slice(0, index)).length;
  }

  function deleteEntry(id: number) {
    const deleteRequest = idb.transaction("entries", "readwrite").objectStore("entries").delete(id);
    deleteRequest.onerror = () => {
      deleteEntryDialog.error = `Could not delete entry: ${deleteRequest.error?.message}`;
    };

    deleteRequest.onsuccess = () => {
      location.href = `/survey/${surveyRecord.id}/entries`;
    };
  }
</script>

<Header
  parent={{ text: "Entries", iconName: "list-ol", hash: `survey/${surveyRecord.id}/entries` }}
  current={{ text: "Entry", iconName: "list-ol" }}
/>

<Container direction="column" padding="large">
  {#each surveyRecord.fields as field, i (field)}
    {@const previousFields = countPreviousFields(i)}
    {#if field.type == "group"}
      <h2>{field.name}</h2>
      {#each field.fields as innerField, innerFieldIndex (innerField)}
        <span>{innerField.name}: {entryRecord.values[previousFields + innerFieldIndex]}</span>
      {/each}
    {:else}
      <span>{field.name}: {entryRecord.values[previousFields]}</span>
    {/if}
  {/each}
</Container>

<footer>
  <Dialog
    bind:this={editEntryDialog.dialog}
    onConfirm={editEntry}
    on:close={() => (editEntryDialog.data = { error: "" })}
  >
    <Button title="Edit entry" slot="opener" let:open on:click={open}>
      <Icon name="pen" />
      Edit
    </Button>

    <span>Edit this entry? This will move it to drafts.</span>
    {#if editEntryDialog.data.error}
      <span>{editEntryDialog.data.error}</span>
    {/if}
  </Dialog>

  <Dialog
    onOpen={(element) => (deleteEntryDialog = { element, error: "" })}
    onConfirm={() => deleteEntry(entryRecord.id)}
    on:close={() => (deleteEntryDialog = { error: "" })}
  >
    <Button title="Delete entry" slot="opener" let:open on:click={open}>
      <Icon name="trash" />
      Delete
    </Button>

    <span>Delete this entry?</span>
    {#if deleteEntryDialog.error}
      <span>{deleteEntryDialog.error}</span>
    {/if}
  </Dialog>
</footer>
