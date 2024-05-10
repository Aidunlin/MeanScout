<script lang="ts">
  import { type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  let {
    idb,
    surveyRecord,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<Survey>;
  } = $props();

  let dialog: Dialog;

  let entryCount = $state(0);
  let error = $state("");

  const entryCountRequest = idb.transaction("entries").objectStore("entries").index("surveyId").count(surveyRecord.id);
  entryCountRequest.onsuccess = () => {
    if (typeof entryCountRequest.result == "number") {
      entryCount = entryCountRequest.result;
    }
  };

  function onconfirm() {
    const deleteTransaction = idb.transaction(["surveys", "entries"], "readwrite");
    deleteTransaction.onabort = () => {
      error ||= `Could not delete survey: ${deleteTransaction.error?.message}`;
    };

    deleteTransaction.oncomplete = () => {
      location.hash = "/";
    };

    const surveyRequest = deleteTransaction.objectStore("surveys").delete(surveyRecord.id);
    surveyRequest.onerror = () => {
      error = `Could not delete survey: ${surveyRequest.error?.message}`;
      deleteTransaction.abort();
    };

    const cursorRequest = deleteTransaction.objectStore("entries").index("surveyId").openCursor(surveyRecord.id);
    cursorRequest.onerror = () => {
      error = `Could not delete survey's entries: ${cursorRequest.error?.message}`;
      deleteTransaction.abort();
    };

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor === undefined) {
        error = "Could not delete survey's entries";
        deleteTransaction.abort();
        return;
      }

      if (cursor === null) {
        return;
      }

      cursor.delete();
      cursor.continue();
    };
  }

  function onclose() {
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Container maxWidth>
    <Icon name="trash" />
    Delete survey
  </Container>
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  <span>Delete "{surveyRecord.name}"?</span>
  {#if entryCount}
    <span>{entryCount} {entryCount > 1 ? "entries" : "entry"} will be lost!</span>
  {/if}
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
