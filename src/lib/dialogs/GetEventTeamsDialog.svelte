<script lang="ts">
  import type { IDBRecord, Survey } from "$lib";
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
  {onConfirm}
  on:close={() => {
    event = "";
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="cloud-arrow-down" />
      Get teams from TBA event
    </Container>
  </Button>

  <span>Get teams from TBA event</span>
  <input bind:value={event} />
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
