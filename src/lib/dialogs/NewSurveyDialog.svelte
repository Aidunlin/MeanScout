<script lang="ts">
  import { surveyTypes, type Survey, type SurveyType } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;

  let name = "";
  let type: SurveyType;
  let error = "";

  function onConfirm() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      error = "Name can't be blank!";
      return;
    }

    if (type == "match") {
      var survey: Survey = {
        name: trimmedName,
        type,
        fields: [],
        matches: [],
        teams: [],
        created: new Date(),
        modified: new Date(),
      };
    } else if (type == "pit") {
      var survey: Survey = {
        name: trimmedName,
        type,
        fields: [],
        teams: [],
        created: new Date(),
        modified: new Date(),
      };
    } else {
      error = "Invalid survey type!";
      return;
    }

    const addRequest = idb.transaction("surveys", "readwrite").objectStore("surveys").add(survey);
    addRequest.onerror = () => {
      error = `Could not add survey: ${addRequest.error?.message}`;
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result;
      if (id == undefined) {
        error = "Could not add survey";
        return;
      }

      location.hash = `/survey/${id}`;
    };
  }
</script>

<Dialog
  {onConfirm}
  on:close={() => {
    name = "";
    error = "";
  }}
>
  <Button title="New survey" slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="plus" />
      New survey
    </Container>
  </Button>

  <span>New survey</span>

  <Container direction="column" gap="none">
    Survey name
    <input bind:value={name} />
  </Container>
  <Container direction="column" gap="none">
    Survey type
    <select bind:value={type}>
      {#each surveyTypes as surveyType}
        <option>{surveyType}</option>
      {/each}
    </select>
  </Container>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
