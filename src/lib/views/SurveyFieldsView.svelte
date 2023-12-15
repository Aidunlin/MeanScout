<script lang="ts">
  import type { IDBRecord, Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import FieldEditor from "$lib/components/FieldEditor.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  let disabled = false;

  const countTransaction = idb.transaction(["drafts", "entries"]);

  const draftCountRequest = countTransaction.objectStore("drafts").index("surveyId").count(surveyRecord.id);
  draftCountRequest.onsuccess = () => {
    disabled ||= draftCountRequest.result > 0;
  };

  const entryCountRequest = countTransaction.objectStore("entries").index("surveyId").count(surveyRecord.id);
  entryCountRequest.onsuccess = () => {
    disabled ||= entryCountRequest.result > 0;
  };

  function newField() {
    surveyRecord.fields = [...surveyRecord.fields, { name: "", type: "toggle" }];
  }
</script>

<Container column padding>
  <h2>Fields</h2>
  {#if disabled}
    <span>Cannot modify fields with entries present!</span>
  {/if}
  {#each surveyRecord.fields as field, fieldIndex (field)}
    <FieldEditor bind:fields={surveyRecord.fields} bind:field {fieldIndex} {disabled} />
  {/each}
</Container>

<footer>
  <Button title="New field" {disabled} on:click={newField}>
    <Icon name="plus" />
    Field
  </Button>
</footer>
