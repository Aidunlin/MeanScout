<script lang="ts">
  import { flattenFields, type Entry, type IDBRecord, type Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import FieldValueEditor from "$lib/components/FieldValueEditor.svelte";
  import Header from "$lib/components/Header.svelte";
  import DeleteDraftDialog from "$lib/dialogs/DeleteDraftDialog.svelte";
  import SubmitDraftDialog from "$lib/dialogs/SubmitDraftDialog.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let draftRecord: IDBRecord<Entry>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);
  $: idb.transaction("drafts", "readwrite").objectStore("drafts").put(draftRecord);

  function countPreviousFields(index: number) {
    return flattenFields(surveyRecord.fields.slice(0, index)).length;
  }
</script>

<Header
  parent={{ text: "Drafts", iconName: "pen-ruler", hash: `survey/${surveyRecord.id}/drafts` }}
  current={{ text: "Draft", iconName: "pen-ruler" }}
/>

<datalist id="teams-list">
  {#each surveyRecord.teams as team}
    <option value={team} />
  {/each}
</datalist>

<Container padding="large" align="end">
  {#each surveyRecord.fields as field, i (field)}
    {@const previousFields = countPreviousFields(i)}
    {#if field.type == "group"}
      <h2>{field.name}</h2>
      <Container align="end" maxWidth>
        {#each field.fields as innerField, innerFieldIndex (innerField)}
          <FieldValueEditor
            field={innerField}
            bind:value={draftRecord.values[previousFields + innerFieldIndex]}
            onChange={() => {
              draftRecord.modified = new Date();
              surveyRecord.modified = new Date();
            }}
          />
        {/each}
      </Container>
    {:else}
      <FieldValueEditor
        {field}
        bind:value={draftRecord.values[previousFields]}
        onChange={() => {
          draftRecord.modified = new Date();
          surveyRecord.modified = new Date();
        }}
      />
    {/if}
  {/each}
</Container>

<footer>
  <SubmitDraftDialog {idb} bind:surveyRecord bind:draftRecord />
  <DeleteDraftDialog {idb} bind:surveyRecord bind:draftRecord />
</footer>
