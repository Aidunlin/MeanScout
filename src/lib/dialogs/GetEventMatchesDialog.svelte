<script lang="ts">
  import { fetchTBA, type Match, type Survey } from "$lib";
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

    let response = await fetchTBA(`/event/${event.trim()}/matches/simple`, $tbaKeyStore);

    if (response.status == "success" && Array.isArray(response.data)) {
      response.data.forEach((match) => {
        if (match.comp_level != "qm") return;

        const matchData: Match = {
          number: match.match_number,
          red1: match.alliances.red.team_keys[0].replace("frc", ""),
          red2: match.alliances.red.team_keys[1].replace("frc", ""),
          red3: match.alliances.red.team_keys[2].replace("frc", ""),
          blue1: match.alliances.blue.team_keys[0].replace("frc", ""),
          blue2: match.alliances.blue.team_keys[1].replace("frc", ""),
          blue3: match.alliances.blue.team_keys[2].replace("frc", ""),
        };

        let indexToReplace = surveyRecord.matches.findIndex((m) => m.number == matchData.number);
        if (indexToReplace == -1) {
          surveyRecord.matches.push(matchData);
        } else {
          surveyRecord.matches[indexToReplace] = matchData;
        }
      });

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
    eventSelect = undefined;
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="cloud-arrow-down" />
      Get matches from TBA event
    </Container>
  </Button>

  <span>Get matches from TBA event</span>
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
