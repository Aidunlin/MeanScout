<script lang="ts">
  import { getDefaultFieldValue, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import FieldEditor from "$lib/components/FieldEditor.svelte";
  import FieldValueEditor from "$lib/components/FieldValueEditor.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let disabled = false;
  let preview = false;

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
    surveyRecord.modified = new Date();
    surveyRecord.fields = [...surveyRecord.fields, { name: "", type: "toggle" }];
  }

  function togglePreview() {
    preview = !preview;
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Fields" iconName="list-check" />

<Container direction="column" padding="large">
  {#if preview}
    <Container align="end">
      {#each surveyRecord.fields as field (field)}
        {#if field.type == "group"}
          <h2>{field.name}</h2>
          <Container align="end" maxWidth>
            {#each field.fields as innerField (innerField)}
              <FieldValueEditor field={innerField} value={getDefaultFieldValue(innerField)} />
            {/each}
          </Container>
        {:else}
          <FieldValueEditor {field} value={getDefaultFieldValue(field)} />
        {/if}
      {/each}
    </Container>
  {:else}
    {#if disabled}
      <span>Cannot modify fields with entries present!</span>
    {/if}
    {#each surveyRecord.fields as field, fieldIndex (field)}
      <FieldEditor
        bind:fields={surveyRecord.fields}
        bind:field
        onChange={() => (surveyRecord.modified = new Date())}
        {fieldIndex}
        {disabled}
      />
    {/each}
  {/if}
</Container>

<footer>
  <Button title="New field" {disabled} on:click={newField}>
    <Icon name="plus" />
    Field
  </Button>
  <Button title="Preview" on:click={togglePreview}>
    {#if preview}
      <Icon name="square-check" />
    {:else}
      <Icon style="regular" name="square" />
    {/if}
    Preview
  </Button>
</footer>
