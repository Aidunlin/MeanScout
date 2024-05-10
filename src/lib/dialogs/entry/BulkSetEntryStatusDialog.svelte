<script lang="ts">
  import type { EntryStatus, Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  let {
    idb,
    surveyRecord,
    from,
    to,
    onset = undefined,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<Survey>;
    from: EntryStatus;
    to: EntryStatus;
    onset?: (() => void) | undefined;
  } = $props();

  let dialog: Dialog;

  let error = $state("");

  function onconfirm() {
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
        onset && onset();
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

  function onclose() {
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Container maxWidth>
    <Icon name="file-pen" />
    Set entries as {to}
  </Container>
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  <span>Set {from} entries as {to}?</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
