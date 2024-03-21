<script lang="ts">
  import { fetchTBA, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { tbaKeyStore, teamStore } from "$lib/settings";

  export let surveyRecord: IDBRecord<Survey>;

  let dialog: Dialog;
  let eventSelect: string | undefined = undefined;
  let error = "";

  $: event = eventSelect ?? "";

  let events: { name: string; key: string }[] = [];

  async function onOpen() {
    if (events.length || !navigator.onLine || !$tbaKeyStore || !$teamStore) {
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
    if (!navigator.onLine) {
      error = "offline";
      return;
    }

    let response = await fetchTBA(`/event/${event.trim()}/teams/keys`, $tbaKeyStore);

    if (response.status == "success" && Array.isArray(response.data)) {
      surveyRecord.modified = new Date();

      response.data.forEach((team) => {
        let teamString = `${team}`.trim().replace("frc", "");
        if (!surveyRecord.teams.includes(teamString)) {
          surveyRecord.teams = [...surveyRecord.teams, teamString];
        }
      });
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
    eventSelect = undefined;
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="cloud-arrow-down" />
      Get teams from TBA event
    </Container>
  </Button>

  <span>Get teams from TBA event</span>
  {#if events.length}
    <select bind:value={eventSelect}>
      {#each events as { name, key }}
        <option value={key}>{name}</option>
      {/each}
    </select>
  {:else if navigator.onLine && $tbaKeyStore && $teamStore}
    <span>Getting events for you...</span>
  {/if}
  <Container direction="column" gap="none">
    Event code
    <input bind:value={event} />
  </Container>
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
