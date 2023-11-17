<script lang="ts">
  import type { IDBRecord, Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import FieldEditor from "$lib/components/FieldEditor.svelte";

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

  let copySurveyDialog = { text: "" };

  function newField() {
    surveyRecord.fields = [...surveyRecord.fields, { name: "", type: "toggle" }];
  }

  function surveyToString() {
    const exportableSurvey = {
      name: surveyRecord.name,
      fields: surveyRecord.fields,
      teams: surveyRecord.teams,
      created: surveyRecord.created,
      modified: surveyRecord.modified,
    };
    return JSON.stringify(exportableSurvey, undefined, "  ");
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
  <Button iconName="plus" text="Field" title="New field" {disabled} on:click={newField} />

  <Dialog
    openButton={{ iconName: "copy", text: "Copy", title: "Copy survey" }}
    onOpen={() => (copySurveyDialog = { text: surveyToString() })}
  >
    <span>Select and copy the survey:</span>
    <Container maxWidth>
      <textarea readonly bind:value={copySurveyDialog.text} />
    </Container>
  </Dialog>
</footer>
