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
    entryRecord.status = "draft";
    entryRecord.modified = new Date();

    const editRequest = idb.transaction("entries", "readwrite").objectStore("entries").put(entryRecord);
    editRequest.onerror = () => {
      error ||= `Could not edit entry: ${editRequest.error?.message}`;
    };

    editRequest.onsuccess = () => {
      surveyRecord.modified = new Date();
      location.hash = `/entry/${entryRecord.id}`;
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
