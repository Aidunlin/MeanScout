<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Entry } from "$lib/entry";
  import type { Survey } from "$lib/survey";

  let {
    idb,
    surveyRecord = $bindable(),
    entryRecord,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<Survey>;
    entryRecord: IDBRecord<Entry>;
  } = $props();

  let dialog: Dialog;

  let error = $state("");

  function onconfirm() {
    const deleteRequest = idb.transaction("entries", "readwrite").objectStore("entries").delete(entryRecord.id);
    deleteRequest.onerror = () => {
      error = `Could not delete entry: ${deleteRequest.error?.message}`;
    };

    deleteRequest.onsuccess = () => {
      surveyRecord.modified = new Date();

      if (entryRecord.status == "draft") {
        location.hash = `/survey/${surveyRecord.id}/entries`;
      } else {
        location.hash = `/survey/${surveyRecord.id}`;
      }
    };
  }

  function onclose() {
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Icon name="trash" />
  Delete
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  <span>Delete this entry?</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
