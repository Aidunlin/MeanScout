<script lang="ts">
  import { fetchTBA, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { tbaKeyStore, teamStore } from "$lib/settings";

  export let surveyRecord: IDBRecord<Survey>;

  let dialog: Dialog;
  let event = surveyRecord.tbaEventKey ?? "";
  let error = "";

  let events: { name: string; key: string }[] = [];

  async function onOpen() {
    if (events.length) {
      return;
    }

    if (!navigator.onLine || !$tbaKeyStore || !$teamStore) {
      return;
    }

    let response = await fetchTBA(`/team/frc${$teamStore}/events/simple`, $tbaKeyStore);

    if (response.status == "success" && Array.isArray(response.data)) {
      response.data.forEach((event) => {
        if (event.year >= new Date().getFullYear() - 1) {
          events = [{ name: `${event.year} ${event.name}`, key: event.key }, ...events];
        }
      });
    } else if (response.status == "not found") {
      error = `could not get events for team ${teamStore}`;
    } else {
      error = "error";
    }
  }

  async function onConfirm() {
    let trimmedEvent = event.trim();

    if (!trimmedEvent) {
      surveyRecord.tbaEventKey = trimmedEvent;
      surveyRecord.modified = new Date();
      dialog.close();
      return;
    }

    if (!navigator.onLine) {
      error = "offline";
      return;
    }

    if (events.map((e) => e.key).includes(trimmedEvent)) {
      surveyRecord.tbaEventKey = trimmedEvent;
      surveyRecord.modified = new Date();
      dialog.close();
      return;
    }

    let response = await fetchTBA(`/event/${trimmedEvent}/simple`, $tbaKeyStore);

    if (response.status == "success") {
      surveyRecord.tbaEventKey = trimmedEvent;
      surveyRecord.modified = new Date();
      dialog.close();
    } else if (response.status == "not found") {
      error = "could not find event";
    } else {
      error = "error";
    }
  }
</script>

<Dialog
  bind:this={dialog}
  {onOpen}
  {onConfirm}
  on:close={() => {
    event = surveyRecord.tbaEventKey ?? "";
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      {#if surveyRecord.tbaEventKey}
        <Icon name="pen" />
        Edit event: {surveyRecord.tbaEventKey}
      {:else}
        <Icon name="plus" />
        Add event
      {/if}
    </Container>
  </Button>

  <span>Edit TBA event:</span>
  <datalist id="events-list">
    {#each events as { name, key }}
      <option value={key}>{name}</option>
    {/each}
  </datalist>
  <input bind:value={event} list="events-list" />
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
