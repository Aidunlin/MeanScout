<script lang="ts">
  import { type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryRecord: IDBRecord<Entry>;

  let error = "";

  function onConfirm() {
    const deleteRequest = idb.transaction("entries", "readwrite").objectStore("entries").delete(entryRecord.id);
    deleteRequest.onerror = () => {
      error = `Could not delete entry: ${deleteRequest.error?.message}`;
    };

    deleteRequest.onsuccess = () => {
      surveyRecord.modified = new Date();
      location.hash = `/survey/${surveyRecord.id}/entries`;
    };
  }
</script>

<Dialog {onConfirm} on:close={() => (error = "")}>
  <Button title="Delete entry" slot="opener" let:open on:click={open}>
    <Icon name="trash" />
    Delete
  </Button>

  <span>Delete this entry?</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
