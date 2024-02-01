<script lang="ts">
  import { type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  let entryCount = 0;

  const entryCountRequest = idb.transaction("entries").objectStore("entries").index("surveyId").count(surveyRecord.id);
  entryCountRequest.onsuccess = () => {
    if (typeof entryCountRequest.result == "number") {
      entryCount = entryCountRequest.result;
    }
  };

  let error = "";

  function onConfirm() {
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
      }

      if (cursor === null) {
        return;
      }

      cursor.delete();
      cursor.continue();
    };
  }
</script>

<Dialog {onConfirm} on:close={() => (error = "")}>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="trash" />
      Delete survey
    </Container>
  </Button>

  <span>Delete "{surveyRecord.name}"?</span>
  {#if entryCount}
    <span>{entryCount} {entryCount > 1 ? "entries" : "entry"} will be lost!</span>
  {/if}
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
