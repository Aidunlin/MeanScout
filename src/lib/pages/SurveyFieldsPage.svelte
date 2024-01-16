<script lang="ts">
  import { getDefaultFieldValue, type IDBRecord, type Survey } from "$lib";
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
    surveyRecord.fields = [...surveyRecord.fields, { name: "", type: "toggle" }];
  }

  function togglePreview() {
    preview = !preview;
  }
</script>

<Header
  parent={{ text: surveyRecord.name, iconName: "list-ul", hash: `survey/${surveyRecord.id}` }}
  current={{ text: "Fields", iconName: "list-check" }}
/>

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
      <FieldEditor bind:fields={surveyRecord.fields} bind:field {fieldIndex} {disabled} />
    {/each}
  {/if}
</Container>

<footer>
  <Container type="button" onClick={newField} title="New field" {disabled}>
    <Icon name="plus" />
    Field
  </Container>
  <Container type="button" onClick={togglePreview} title="Preview">
    {#if preview}
      <Icon name="square-check" />
    {:else}
      <Icon style="regular" name="square" />
    {/if}
    Preview
  </Container>
</footer>
