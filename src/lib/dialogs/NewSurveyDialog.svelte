<script lang="ts">
  import { type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;

  let name = "";
  let error = "";

  function onConfirm() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      error = "Name can't be blank!";
      return;
    }

    const survey: Survey = {
      name: trimmedName,
      fields: [
        { name: "Team", type: "team" },
        { name: "Match", type: "match" },
        { name: "Absent", type: "toggle" },
      ],
      matches: [],
      teams: [],
      created: new Date(),
      modified: new Date(),
    };

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

  <span>Enter name for new survey:</span>
  <input bind:value={name} />
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
