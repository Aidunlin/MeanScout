<script lang="ts">
  import type { Match } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { MatchSurvey } from "$lib/survey";

  let {
    surveyRecord = $bindable(),
    match,
  }: {
    surveyRecord: IDBRecord<MatchSurvey>;
    match: Match;
  } = $props();

  let dialog: Dialog;

  function onconfirm() {
    surveyRecord.modified = new Date();
    surveyRecord.matches = surveyRecord.matches.filter((m) => m.number != match.number);
    dialog.close();
  }
</script>

<Button onclick={() => dialog.open()}>
  <Icon name="trash" />
</Button>

<Dialog bind:this={dialog} {onconfirm}>
  <span>Delete match {match.number}?</span>
</Dialog>
