<script lang="ts">
  import {
    flattenFields,
    getDefaultFieldValue,
    type DialogDataType,
    type Entry,
    type IDBRecord,
    type Survey,
  } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import FieldValueEditor from "$lib/components/FieldValueEditor.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let draftRecord: IDBRecord<Entry>;

  $: idb.transaction("drafts", "readwrite").objectStore("drafts").put(draftRecord);

  let submitDraftDialog: DialogDataType<{ error: string }> = { data: { error: "" } };

  function validateDraft() {
    let error = "";
    const fields = flattenFields(surveyRecord.fields);

    draftRecord.values.forEach((value, i) => {
      switch (fields[i].type) {
        case "team":
          if (!/^\d{1,5}[A-Z]?$/.test(value)) {
            error = `Invalid value for ${fields[i].name}`;
          }
          if (surveyRecord.teams.length && !surveyRecord.teams.includes(value)) {
            error = `Invalid value for ${fields[i].name} (team not allowlisted)`;
          }
          break;
        case "match":
          if (!/\d{1,3}/.test(value)) {
            error = `Invalid value for ${fields[i].name}`;
          }
          break;
      }

      if (value == undefined || typeof value !== typeof getDefaultFieldValue(fields[i])) {
        error = `Invalid value for ${fields[i].name}`;
      }
    });

    return error;
  }

  function startNewDraft() {
    const flattenedFields = flattenFields(surveyRecord.fields);

    const draft: Entry = {
      surveyId: draftRecord.surveyId,
      values: flattenedFields.map((field, i) => {
        switch (field.type) {
          case "match":
            return (draftRecord.values[i] ?? 0) + 1;
          default:
            return getDefaultFieldValue(field);
        }
      }),
      created: new Date(),
      modified: new Date(),
    };

    const addRequest = idb.transaction("drafts", "readwrite").objectStore("drafts").add(draft);
    addRequest.onerror = () => {
      submitDraftDialog.data.error = `Could not create new draft: ${addRequest.error?.message}`;
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) {
        submitDraftDialog.data.error = "Could not create new draft";
        return;
      }

      submitDraftDialog.dialog?.close();
      location.hash = `/draft/${id}`;
    };
  }

  function submitAndStartNewDraft() {
    const error = validateDraft();
    if (error) {
      submitDraftDialog.data.error = `Could not submit draft: ${error}`;
      return;
    }

    const moveTransaction = idb.transaction(["drafts", "entries"], "readwrite");
    moveTransaction.onabort = () => {
      submitDraftDialog.data.error = `Could not submit draft: ${moveTransaction.error?.message}`;
    };

    const entryRecord = structuredClone(draftRecord) as Entry & { id?: number };
    delete entryRecord.id;
    moveTransaction.objectStore("entries").add(entryRecord);
    moveTransaction.objectStore("drafts").delete(draftRecord.id);

    moveTransaction.oncomplete = () => startNewDraft();
  }

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

<Container padding alignEnd>
  {#each surveyRecord.fields as field, i (field)}
    {@const previousFields = countPreviousFields(i)}
    {#if field.type == "group"}
      <h2>{field.name}</h2>
      <Container alignEnd maxWidth>
        {#each field.fields as innerField, innerFieldIndex (innerField)}
          <FieldValueEditor field={innerField} bind:value={draftRecord.values[previousFields + innerFieldIndex]} />
        {/each}
      </Container>
    {:else}
      <FieldValueEditor {field} bind:value={draftRecord.values[previousFields]} />
    {/if}
  {/each}
</Container>

<footer>
  <Dialog
    bind:this={submitDraftDialog.dialog}
    onConfirm={submitAndStartNewDraft}
    on:close={() => (submitDraftDialog.data = { error: "" })}
  >
    <Button title="Submit draft" slot="opener" let:open on:click={open}>
      <Icon name="floppy-disk" />
      Submit
    </Button>

    <span>Submit this draft and start a new one?</span>
    {#if submitDraftDialog.data.error}
      <span>{submitDraftDialog.data.error}</span>
    {/if}
  </Dialog>
</footer>
