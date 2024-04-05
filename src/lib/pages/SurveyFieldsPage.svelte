<script lang="ts">
  import { type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import FieldEditor from "$lib/components/FieldEditor.svelte";
  import FieldValueEditor from "$lib/components/FieldValueEditor.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { getDefaultFieldValue } from "$lib/field";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let entriesPresent = false;
  let disabled = surveyRecord.expressions.length > 0 || surveyRecord.pickLists.length > 0;
  let preview = false;
  let previewAbsentValue = false;

  const entryCountRequest = idb.transaction("entries").objectStore("entries").index("surveyId").count(surveyRecord.id);
  entryCountRequest.onsuccess = () => {
    entriesPresent = entryCountRequest.result > 0;
    if (!disabled) disabled = entriesPresent;
  };

  function newField() {
    surveyRecord.modified = new Date();
    surveyRecord.fields = [...surveyRecord.fields, { name: "", type: "toggle" }];
  }

  function togglePreview() {
    preview = !preview;
  }

  function onChange() {
    surveyRecord.modified = new Date();
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Fields" iconName="list-check" />

<Container direction="column" padding="large">
  {#if preview}
    <Container align="end">
      <Container direction="column" gap="none">
        Team
        <input class="team" list="teams-list" maxlength="6" />
      </Container>
      {#if surveyRecord.type == "match"}
        <Container direction="column" gap="none">
          Match
          <input class="match" type="number" pattern="[0-9]*" required />
        </Container>
        <Container direction="column" gap="none">
          <Button on:click={() => (previewAbsentValue = !previewAbsentValue)}>
            {#if previewAbsentValue}
              <Icon name="square-check" />
            {:else}
              <Icon style="regular" name="square" />
            {/if}
            Absent
          </Button>
        </Container>
      {/if}

      {#if surveyRecord.type != "match" || !previewAbsentValue}
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
      {/if}
    </Container>
  {:else}
    {#if disabled}
      <span>
        Cannot modify fields with
        {#if entriesPresent}
          entries
        {:else}
          pick lists/expressions
        {/if}
        present!
      </span>
    {/if}
    {#each surveyRecord.fields as field, fieldIndex (field)}
      <FieldEditor bind:fields={surveyRecord.fields} bind:field {fieldIndex} {disabled} {onChange} />
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

<style>
  .team {
    width: 130px;
  }

  .match {
    width: 80px;
  }
</style>
