<script lang="ts">
  import { type Entry, type Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import FieldValueEditor from "$lib/components/FieldValueEditor.svelte";
  import Header from "$lib/components/Header.svelte";
  import DeleteEntryDialog from "$lib/dialogs/entry/DeleteEntryDialog.svelte";
  import EditEntryDialog from "$lib/dialogs/entry/EditEntryDialog.svelte";
  import ExportEntryDialog from "$lib/dialogs/entry/ExportEntryDialog.svelte";
  import SubmitDraftDialog from "$lib/dialogs/entry/SubmitEntryDialog.svelte";
  import { flattenFields } from "$lib/field";

  let {
    idb,
    surveyRecord,
    entryRecord,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<Survey>;
    entryRecord: IDBRecord<Entry>;
  } = $props();

  $effect(() => {
    idb.transaction("surveys", "readwrite").objectStore("surveys").put($state.snapshot(surveyRecord));
  });

  $effect(() => {
    idb.transaction("entries", "readwrite").objectStore("entries").put($state.snapshot(entryRecord));
  });

  function countPreviousFields(index: number) {
    return flattenFields(surveyRecord.fields.slice(0, index)).length;
  }

  function onchange() {
    entryRecord.modified = new Date();
    surveyRecord.modified = new Date();
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Entry" iconName="list-ol" />

{#if entryRecord.status == "draft"}
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
              {onchange}
            />
          {/each}
        </Container>
      {:else}
        <FieldValueEditor {field} bind:value={entryRecord.values[previousFields]} {onchange} />
      {/if}
    {/each}
  </Container>
{:else}
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
{/if}

<footer>
  {#if entryRecord.status == "draft"}
    <SubmitDraftDialog {idb} bind:surveyRecord {entryRecord} />
  {:else}
    <EditEntryDialog {idb} bind:surveyRecord {entryRecord} />
  {/if}

  <DeleteEntryDialog {idb} bind:surveyRecord {entryRecord} />
</footer>
