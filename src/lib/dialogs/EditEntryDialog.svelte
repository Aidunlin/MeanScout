<script lang="ts">
  import { type Entry, type IDBRecord, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryRecord: IDBRecord<Entry>;

  let error = "";

  function onConfirm() {
    const moveTransaction = idb.transaction(["drafts", "entries"], "readwrite");
    moveTransaction.onabort = () => {
      error ||= `Could not edit entry: ${moveTransaction.error?.message}`;
    };

    const deleteRequest = moveTransaction.objectStore("entries").delete(entryRecord.id);
    deleteRequest.onerror = () => {
      error = `Could not edit entry: ${deleteRequest.error?.message}`;
      moveTransaction.abort();
    };

    const draftRecord = structuredClone(entryRecord) as Entry & { id?: number };
    delete draftRecord.id;

    const addRequest = moveTransaction.objectStore("drafts").add(draftRecord);
    deleteRequest.onerror = () => {
      error = `Could not edit entry: ${deleteRequest.error?.message}`;
      moveTransaction.abort();
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result;
      if (id == undefined) {
        moveTransaction.abort();
        error = "Could not edit entry: entry record id is undefined";
        return;
      }

      surveyRecord.modified = new Date();
      location.hash = `/draft/${id}`;
    };
  }
</script>

<Dialog {onConfirm} on:close={() => (error = "")}>
  <Button title="Edit entry" slot="opener" let:open on:click={open}>
    <Icon name="pen" />
    Edit
  </Button>

  <span>Edit this entry? This will move it to drafts.</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
