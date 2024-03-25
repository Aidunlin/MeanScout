<script lang="ts">
  import { type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { flattenFields, getDefaultFieldValue } from "$lib/field";
  import { targetStore } from "$lib/settings";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let draftRecord: IDBRecord<Entry>;

  let error = "";

  const flattenedFields = flattenFields(surveyRecord.fields);

  function validateDraft() {
    let validateError = "";

    const validTeamValues = [...surveyRecord.teams];
    const matchFieldIndex = flattenedFields.findIndex((field) => field.type == "match");
    if (matchFieldIndex != -1) {
      const matchValue = draftRecord.values[matchFieldIndex];

      if (!/\d{1,3}/.test(matchValue)) {
        return `Invalid value for ${flattenedFields[matchFieldIndex].name}`;
      }

      if (surveyRecord.matches.length) {
        const match = surveyRecord.matches.find((m) => m.number == matchValue);
        if (!match) return `Invalid value for ${flattenedFields[matchFieldIndex].name}`;

        switch ($targetStore) {
          case "red 1":
            validTeamValues.push(match.red1);
            break;
          case "red 2":
            validTeamValues.push(match.red2);
            break;
          case "red 3":
            validTeamValues.push(match.red3);
            break;
          case "blue 1":
            validTeamValues.push(match.blue1);
            break;
          case "blue 2":
            validTeamValues.push(match.blue2);
            break;
          case "blue 3":
            validTeamValues.push(match.blue3);
            break;
          case "red":
            validTeamValues.push(match.red1, match.red2, match.red3);
            break;
          case "blue":
            validTeamValues.push(match.blue1, match.blue2, match.blue3);
            break;
          default:
            validTeamValues.push(match.red1, match.red2, match.red3, match.blue1, match.blue2, match.blue3);
        }
      }
    }

    draftRecord.values.forEach((value, i) => {
      switch (flattenedFields[i].type) {
        case "team":
          if (!/^\d{1,5}[A-Z]?$/.test(value)) {
            validateError = `Invalid value for ${flattenedFields[i].name}`;
          }
          if (validTeamValues.length && !validTeamValues.includes(value)) {
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

  function onConfirm() {
    const validateError = validateDraft();
    if (validateError) {
      error = `Could not submit draft: ${validateError}`;
      return;
    }

    draftRecord.status = "submitted";
    draftRecord.modified = new Date();

    const submitRequest = idb.transaction("entries", "readwrite").objectStore("entries").put(draftRecord);
    submitRequest.onerror = () => {
      error = `Could not submit draft: ${submitRequest.error?.message}`;
    };

    submitRequest.onsuccess = () => {
      surveyRecord.modified = new Date();
      location.hash = `/survey/${surveyRecord.id}`;
    };
  }
</script>

<Dialog {onConfirm} on:close={() => (error = "")}>
  <Button title="Submit draft" slot="opener" let:open on:click={open}>
    <Icon name="floppy-disk" />
    Submit
  </Button>

  <span>Submit this draft?</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
