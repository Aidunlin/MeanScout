<script lang="ts">
  import type { IDBRecord, Match, Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { fetchTBA, tbaKeyStore } from "$lib/tba";

  export let surveyRecord: IDBRecord<Survey>;

  let dialog: Dialog;
  let event = "";
  let error = "";

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
  {onConfirm}
  on:close={() => {
    event = "";
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="cloud-arrow-down" />
      Get matches from TBA event
    </Container>
  </Button>

  <span>Get matches from TBA event</span>
  <input bind:value={event} />
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
