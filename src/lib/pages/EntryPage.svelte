<script lang="ts">
  import { flattenConfigs, type DialogDataType, type Entry, type IDBRecord, type Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryRecord: IDBRecord<Entry>;

  let editEntryDialog: DialogDataType<{ error: string }> = { data: { error: "" } };

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

  function countPreviousConfigs(index: number) {
    return flattenConfigs(surveyRecord.configs.slice(0, index)).length;
  }
</script>

<Header title="Entry ({surveyRecord.name})" backLink="survey/{surveyRecord.id}/entries" />

<Container column padding>
  {#each surveyRecord.configs as config, i (config)}
    {#if config.type == "group"}
      <h2>{config.name}</h2>
      {#each config.configs as innerConfig, innerConfigIndex (innerConfig)}
        <span>{innerConfig.name}: {entryRecord.values[innerConfigIndex + countPreviousConfigs(i)]}</span>
      {/each}
    {:else}
      <span>{config.name}: {entryRecord.values[countPreviousConfigs(i)]}</span>
    {/if}
  {/each}
</Container>

<footer>
  <Dialog
    bind:this={editEntryDialog.dialog}
    openButton={{ iconName: "pen", text: "Edit", title: "Edit entry" }}
    onConfirm={editEntry}
    on:close={() => (editEntryDialog.data = { error: "" })}
  >
    <span>Edit this entry? This will move it to drafts.</span>
    {#if editEntryDialog.data.error}
      <span>{editEntryDialog.data.error}</span>
    {/if}
  </Dialog>
</footer>
