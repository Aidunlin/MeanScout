<script lang="ts">
  import type { EntryStatus, Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let from: EntryStatus;
  export let to: EntryStatus;
  export let onSet: (() => void) | undefined = undefined;

  let dialog: Dialog;
  let error = "";

  function onConfirm() {
    let cursorRequest = idb
      .transaction("entries", "readwrite")
      .objectStore("entries")
      .index("surveyId")
      .openCursor(surveyRecord.id);
    cursorRequest.onerror = () => {
      error = `Could not set entries as ${to}: ${cursorRequest.error?.message}`;
    };

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor === undefined) {
        error = `Could not set entries as ${to}`;
        return;
      }

      if (cursor === null) {
        onSet && onSet();
        dialog.close();
        return;
      }

      if (cursor.value.status == from) {
        cursor.value.status = to;
        cursor.update(cursor.value);
      }
      cursor.continue();
    };
  }
</script>

<Dialog bind:this={dialog} {onConfirm} on:close={() => (error = "")}>
  <Button title="Set entries as {to}" slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="file-pen" />
      Set entries as {to}
    </Container>
  </Button>

  <span>Set {from} entries as {to}?</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
