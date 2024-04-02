<script lang="ts">
  import type { Match, MatchSurvey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let surveyRecord: IDBRecord<MatchSurvey>;

  let dialog: Dialog;
  let error = "";

  let matchInput = {
    number: "",
    red1: "",
    red2: "",
    red3: "",
    blue1: "",
    blue2: "",
    blue3: "",
  };

  function onConfirm() {
    surveyRecord.modified = new Date();

    const number = parseFloat(matchInput.number);
    if (Number.isNaN(number) || !Number.isInteger(number) || number < 1 || number > 999) {
      error = "invalid match number!";
      return;
    }

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

    const matchData: Match = { ...matchInput, number };

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
    matchInput = {
      number: "",
      red1: "",
      red2: "",
      red3: "",
      blue1: "",
      blue2: "",
      blue3: "",
    };
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="plus" />
      Add match
    </Container>
  </Button>

  Add match
  <Container direction="column" gap="none">
    Number
    <input type="number" pattern="[0-9]*" bind:value={matchInput.number} />
  </Container>
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
