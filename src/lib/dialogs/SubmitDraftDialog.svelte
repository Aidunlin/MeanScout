<script lang="ts">
  import { type Entry, type MatchEntry, type Survey } from "$lib";
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

    if (surveyRecord.type == "match" && draftRecord.type == "match") {
      if (!/\d{1,3}/.test(`${draftRecord.match}`)) {
        return "Invalid value for match";
      }

      if (surveyRecord.matches.length) {
        const match = surveyRecord.matches.find((m) => m.number == (draftRecord as MatchEntry).match);
        if (!match) return "Invalid value for match";

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
          default:
            validTeamValues.push(match.red1, match.red2, match.red3, match.blue1, match.blue2, match.blue3);
        }
      }
    }

    const temHasInvalidFormat = !/^\d{1,5}[A-Z]?$/.test(draftRecord.team);
    const teamIsNotAllowlisted = validTeamValues.length && !validTeamValues.includes(draftRecord.team);

    if (temHasInvalidFormat || teamIsNotAllowlisted) {
      validateError = "Invalid value for team";
    }

    draftRecord.values.forEach((value, i) => {
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
