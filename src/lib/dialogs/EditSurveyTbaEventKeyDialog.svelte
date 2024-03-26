<script lang="ts">
  import { type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { tbaAuthKeyStore, teamStore } from "$lib/settings";
  import { tbaEventExists, tbaGetTeamEvents } from "$lib/tba";

  export let surveyRecord: IDBRecord<Survey>;

  let dialog: Dialog;
  let event = surveyRecord.tbaEventKey ?? "";
  let error = "";

  let events: { name: string; key: string }[] = [];

  async function onOpen() {
    if (events.length) {
      return;
    }

    if (!$tbaAuthKeyStore || !$teamStore) {
      return;
    }

    const response = await tbaGetTeamEvents($teamStore, $tbaAuthKeyStore);

    if (response.events) {
      events = response.events;
    } else if (response.error) {
      console.log(response.error);
      error = response.error;
    }
  }

  async function onConfirm() {
    event = event.trim();

    if (!event) {
      surveyRecord.tbaEventKey = event;
      surveyRecord.modified = new Date();
      dialog.close();
      return;
    }

    const eventAlreadyFound = events.map((e) => e.key).includes(event);

    if (eventAlreadyFound || (await tbaEventExists(event, $tbaAuthKeyStore))) {
      surveyRecord.tbaEventKey = event;
      surveyRecord.modified = new Date();
      dialog.close();
    } else {
      error = "could not find event";
      console.log(error);
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
