<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { surveyTypes, type Survey, type SurveyType } from "$lib/survey";

  let {
    idb,
  }: {
    idb: IDBDatabase;
  } = $props();

  let dialog: Dialog;

  let name = $state("");
  let type = $state<SurveyType>("match");
  let error = $state("");

  function onconfirm() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      error = "Name can't be blank!";
      return;
    }

    let survey: Survey;
    if (type == "match") {
      survey = {
        name: trimmedName,
        type,
        fields: [],
        matches: [],
        teams: [],
        expressions: [],
        pickLists: [],
        created: new Date(),
        modified: new Date(),
      };
    } else if (type == "pit") {
      survey = {
        name: trimmedName,
        type,
        fields: [],
        teams: [],
        expressions: [],
        pickLists: [],
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

  function onclose() {
    name = "";
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Container maxWidth>
    <Icon name="plus" />
    New survey
  </Container>
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
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
