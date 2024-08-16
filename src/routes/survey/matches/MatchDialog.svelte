<script lang="ts">
  import type { Match } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { MatchSurvey } from "$lib/survey";

  let {
    surveyRecord = $bindable(),
  }: {
    surveyRecord: IDBRecord<MatchSurvey>;
  } = $props();

  let dialog: Dialog;

  let error = $state("");
  let matchNumber = $state<number | undefined>(undefined);
  let match = $state<Match>({
    number: 0,
    red1: "",
    red2: "",
    red3: "",
    blue1: "",
    blue2: "",
    blue3: "",
  });

  export function newMatch() {
    matchNumber = undefined;
    match = {
      number: 0,
      red1: "",
      red2: "",
      red3: "",
      blue1: "",
      blue2: "",
      blue3: "",
    };

    for (const m of surveyRecord.matches) {
      if (m.number > match.number) {
        match.number = m.number + 1;
      }
    }

    dialog.open();
  }

  export function editMatch(number: number) {
    matchNumber = number;
    match = structuredClone($state.snapshot(surveyRecord.matches.find((m) => m.number == number))) ?? {
      number: 0,
      red1: "",
      red2: "",
      red3: "",
      blue1: "",
      blue2: "",
      blue3: "",
    };
    dialog.open();
  }

  function onconfirm() {
    surveyRecord.modified = new Date();

    const number = parseFloat(`${match.number}`);
    if (Number.isNaN(number) || !Number.isInteger(number) || number < 1 || number > 999) {
      error = "invalid match number!";
      return;
    }

    if (!match.red1.trim()) {
      error = "invalid value for red 1!";
      return;
    }
    if (!match.red2.trim()) {
      error = "invalid value for red 2!";
      return;
    }
    if (!match.red3.trim()) {
      error = "invalid value for red 3!";
      return;
    }

    if (!match.blue1.trim()) {
      error = "invalid value for blue 1!";
      return;
    }
    if (!match.blue2.trim()) {
      error = "invalid value for blue 2!";
      return;
    }
    if (!match.blue3.trim()) {
      error = "invalid value for blue 3!";
      return;
    }

    let indexToReplace = surveyRecord.matches.findIndex((m) => m.number == match.number);
    if (indexToReplace == -1) {
      surveyRecord.matches = [...surveyRecord.matches, structuredClone($state.snapshot(match))];
    } else {
      surveyRecord.matches[indexToReplace] = structuredClone($state.snapshot(match));
    }

    dialog.close();
  }

  function onclose() {
    match = {
      number: 0,
      red1: "",
      red2: "",
      red3: "",
      blue1: "",
      blue2: "",
      blue3: "",
    };
    error = "";
  }
</script>

<Button onclick={newMatch}>
  <Container maxWidth>
    <Icon name="plus" />
    Add match
  </Container>
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  {#if matchNumber == undefined}
    <span>Add match</span>
    <Container direction="column" gap="none">
      Number
      <input type="number" pattern="[0-9]*" bind:value={match.number} />
    </Container>
  {:else}
    <span>Edit match {match.number}</span>
  {/if}

  <Container direction="column" gap="none">
    Red 1
    <input maxlength="5" bind:value={match.red1} />
  </Container>
  <Container direction="column" gap="none">
    Red 2
    <input maxlength="5" bind:value={match.red2} />
  </Container>
  <Container direction="column" gap="none">
    Red 3
    <input maxlength="5" bind:value={match.red3} />
  </Container>
  <Container direction="column" gap="none">
    Blue 1
    <input maxlength="5" bind:value={match.blue1} />
  </Container>
  <Container direction="column" gap="none">
    Blue 2
    <input maxlength="5" bind:value={match.blue2} />
  </Container>
  <Container direction="column" gap="none">
    Blue 3
    <input maxlength="5" bind:value={match.blue3} />
  </Container>
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
