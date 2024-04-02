<script lang="ts">
  import { type Match, type MatchSurvey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let surveyRecord: IDBRecord<MatchSurvey>;
  export let match: Match;

  let dialog: Dialog;

  function onConfirm() {
    surveyRecord.modified = new Date();
    surveyRecord.matches = surveyRecord.matches.filter((m) => m.number != match.number);
    dialog.close();
  }
</script>

<Dialog bind:this={dialog} {onConfirm}>
  <Button title="Delete match" slot="opener" let:open on:click={open}>
    <Icon name="trash" />
  </Button>

  <span>Delete match {match.number}?</span>
</Dialog>
