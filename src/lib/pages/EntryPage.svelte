<script lang="ts">
  import { flattenFields, type Entry, type IDBRecord, type Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import DeleteEntryDialog from "$lib/dialogs/DeleteEntryDialog.svelte";
  import EditEntryDialog from "$lib/dialogs/EditEntryDialog.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryRecord: IDBRecord<Entry>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  function countPreviousFields(index: number) {
    return flattenFields(surveyRecord.fields.slice(0, index)).length;
  }
</script>

<Header backLink="survey/{surveyRecord.id}/entries" title="Entry" iconName="list-ol" />

<Container direction="column" padding="large">
  {#each surveyRecord.fields as field, i (field)}
    {@const previousFields = countPreviousFields(i)}
    {#if field.type == "group"}
      <h2>{field.name}</h2>
      {#each field.fields as innerField, innerFieldIndex (innerField)}
        <span>{innerField.name}: {entryRecord.values[previousFields + innerFieldIndex]}</span>
      {/each}
    {:else}
      <span>{field.name}: {entryRecord.values[previousFields]}</span>
    {/if}
  {/each}
</Container>

<footer>
  <EditEntryDialog {idb} bind:surveyRecord bind:entryRecord />
  <DeleteEntryDialog {idb} bind:surveyRecord bind:entryRecord />
</footer>
