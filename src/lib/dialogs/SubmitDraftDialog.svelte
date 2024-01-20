<script lang="ts">
  import { flattenFields, getDefaultFieldValue, type Entry, type IDBRecord, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let draftRecord: IDBRecord<Entry>;

  let error = "";

  const flattenedFields = flattenFields(surveyRecord.fields);

  function validateDraft() {
    let validateError = "";

    draftRecord.values.forEach((value, i) => {
      switch (flattenedFields[i].type) {
        case "team":
          if (!/^\d{1,5}[A-Z]?$/.test(value)) {
            validateError = `Invalid value for ${flattenedFields[i].name}`;
          }
          if (surveyRecord.teams.length && !surveyRecord.teams.includes(value)) {
            validateError = `Invalid value for ${flattenedFields[i].name} (team not allowlisted)`;
          }
          break;
        case "match":
          if (!/\d{1,3}/.test(value)) {
            validateError = `Invalid value for ${flattenedFields[i].name}`;
          }
          break;
      }

      if (value == undefined || typeof value !== typeof getDefaultFieldValue(flattenedFields[i])) {
        validateError = `Invalid value for ${flattenedFields[i].name}`;
      }
    });

    return validateError;
  }

  function startNewDraft() {
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
      error = `Could not create new draft: ${addRequest.error?.message}`;
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) {
        error = "Could not create new draft";
        return;
      }

      surveyRecord.modified = new Date();
      location.hash = `/draft/${id}`;
    };
  }

  function onConfirm() {
    const validateError = validateDraft();
    if (validateError) {
      error = `Could not submit draft: ${validateError}`;
      return;
    }

    const moveTransaction = idb.transaction(["drafts", "entries"], "readwrite");
    moveTransaction.onabort = () => {
      error = `Could not submit draft: ${moveTransaction.error?.message}`;
    };

    const entryRecord = structuredClone(draftRecord) as Entry & { id?: number };
    delete entryRecord.id;
    moveTransaction.objectStore("entries").add(entryRecord);
    moveTransaction.objectStore("drafts").delete(draftRecord.id);

    moveTransaction.oncomplete = () => startNewDraft();
  }
</script>

<Dialog {onConfirm} on:close={() => (error = "")}>
  <Button title="Submit draft" slot="opener" let:open on:click={open}>
    <Icon name="floppy-disk" />
    Submit
  </Button>

  <span>Submit this draft and start a new one?</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
