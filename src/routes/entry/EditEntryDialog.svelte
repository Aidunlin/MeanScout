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
    entryRecord.status = "draft";
    entryRecord.modified = new Date();

    const editRequest = idb
      .transaction("entries", "readwrite")
      .objectStore("entries")
      .put($state.snapshot(entryRecord));

    editRequest.onerror = () => {
      error = `Could not edit entry: ${editRequest.error?.message}`;
    };

    editRequest.onsuccess = () => {
      surveyRecord.modified = new Date();
      location.hash = `/entry/${entryRecord.id}`;
    };
  }

  function onclose() {
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Icon name="pen" />
  Edit
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  <span>Edit this entry?</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
