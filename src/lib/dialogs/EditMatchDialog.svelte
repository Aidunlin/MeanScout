<script lang="ts">
  import type { Match, Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let surveyRecord: IDBRecord<Survey>;
  export let match: Match;

  let dialog: Dialog;
  let error = "";

  let matchInput = { ...match };

  function onConfirm() {
    surveyRecord.modified = new Date();

    if (!matchInput.red1.trim()) {
      error = "invalid value for red 1!";
      return;
    }
    if (!matchInput.red2.trim()) {
      error = "invalid value for red 2!";
      return;
    }
    if (!matchInput.red3.trim()) {
      error = "invalid value for red 3!";
      return;
    }

    if (!matchInput.blue1.trim()) {
      error = "invalid value for blue 1!";
      return;
    }
    if (!matchInput.blue2.trim()) {
      error = "invalid value for blue 2!";
      return;
    }
    if (!matchInput.blue3.trim()) {
      error = "invalid value for blue 3!";
      return;
    }

    const matchData: Match = { ...matchInput };

    let indexToReplace = surveyRecord.matches.findIndex((m) => m.number == matchData.number);
    if (indexToReplace == -1) {
      surveyRecord.matches = [...surveyRecord.matches, matchData];
    } else {
      surveyRecord.matches[indexToReplace] = matchData;
    }

    dialog.close();
  }
</script>

<Dialog
  bind:this={dialog}
  {onConfirm}
  on:close={() => {
    matchInput = { ...match };
    error = "";
  }}
>
  <Button title="Edit match {match.number}" slot="opener" let:open on:click={open}>
    <Icon name="pen" />
  </Button>

  Edit match {match.number}
  <Container direction="column" gap="none">
    Red 1
    <input maxlength="5" bind:value={matchInput.red1} />
  </Container>
  <Container direction="column" gap="none">
    Red 2
    <input maxlength="5" bind:value={matchInput.red2} />
  </Container>
  <Container direction="column" gap="none">
    Red 3
    <input maxlength="5" bind:value={matchInput.red3} />
  </Container>
  <Container direction="column" gap="none">
    Blue 1
    <input maxlength="5" bind:value={matchInput.blue1} />
  </Container>
  <Container direction="column" gap="none">
    Blue 2
    <input maxlength="5" bind:value={matchInput.blue2} />
  </Container>
  <Container direction="column" gap="none">
    Blue 3
    <input maxlength="5" bind:value={matchInput.blue3} />
  </Container>
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
