<script lang="ts">
  import { type Entry, type Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import FieldValueEditor from "$lib/components/FieldValueEditor.svelte";
  import Header from "$lib/components/Header.svelte";
  import DeleteDraftDialog from "$lib/dialogs/entry/DeleteDraftDialog.svelte";
  import DeleteEntryDialog from "$lib/dialogs/entry/DeleteEntryDialog.svelte";
  import EditEntryDialog from "$lib/dialogs/entry/EditEntryDialog.svelte";
  import ExportEntryDialog from "$lib/dialogs/entry/ExportEntryDialog.svelte";
  import SubmitDraftDialog from "$lib/dialogs/entry/SubmitDraftDialog.svelte";
  import { flattenFields } from "$lib/field";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryRecord: IDBRecord<Entry>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);
  $: idb.transaction("entries", "readwrite").objectStore("entries").put(entryRecord);

  function countPreviousFields(index: number) {
    return flattenFields(surveyRecord.fields.slice(0, index)).length;
  }

  function onChange() {
    entryRecord.modified = new Date();
    surveyRecord.modified = new Date();
  }
</script>

{#if entryRecord.status == "draft"}
  <Header backLink="survey/{surveyRecord.id}" title="Draft" iconName="pen-ruler" />

  <Container padding="large" align="end">
    <Container direction="column">
      <span>Team: <strong>{entryRecord.team}</strong></span>
      {#if entryRecord.type == "match"}
        <span>Match: <strong>{entryRecord.match}</strong></span>
      {/if}
    </Container>

    {#each surveyRecord.fields as field, i (field)}
      {@const previousFields = countPreviousFields(i)}
      {#if field.type == "group"}
        <h2>{field.name}</h2>
        <Container align="end" maxWidth>
          {#each field.fields as innerField, innerFieldIndex (innerField)}
            <FieldValueEditor
              field={innerField}
              bind:value={entryRecord.values[previousFields + innerFieldIndex]}
              {onChange}
            />
          {/each}
        </Container>
      {:else}
        <FieldValueEditor {field} bind:value={entryRecord.values[previousFields]} {onChange} />
      {/if}
    {/each}
  </Container>

  <footer>
    <SubmitDraftDialog {idb} bind:surveyRecord draftRecord={entryRecord} />
    <DeleteDraftDialog {idb} bind:surveyRecord draftRecord={entryRecord} />
  </footer>
{:else}
  <Header backLink="survey/{surveyRecord.id}/entries" title="Entry" iconName="list-ol" />

  <Container padding="large">
    <ExportEntryDialog {surveyRecord} entry={entryRecord} />
  </Container>

  <Container direction="column" padding="large">
    <span>Team: <strong>{entryRecord.team}</strong></span>
    {#if entryRecord.type == "match"}
      <span>Match: <strong>{entryRecord.match}</strong></span>
      <span>Absent: <strong>{entryRecord.absent}</strong></span>
    {/if}

    {#if entryRecord.type != "match" || !entryRecord.absent}
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
    {/if}
  </Container>

  <footer>
    <EditEntryDialog {idb} bind:surveyRecord {entryRecord} />
    <DeleteEntryDialog {idb} bind:surveyRecord {entryRecord} />
  </footer>
{/if}
