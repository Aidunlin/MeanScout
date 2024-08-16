<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Survey } from "$lib/survey";

  let {
    surveyRecord = $bindable(),
    pickListIndex,
  }: {
    surveyRecord: IDBRecord<Survey>;
    pickListIndex: number;
  } = $props();

  let dialog: Dialog;

  function onConfirm() {
    surveyRecord.pickLists = surveyRecord.pickLists.toSpliced(pickListIndex, 1);
    surveyRecord.modified = new Date();
    dialog.close();
  }
</script>

<Button onclick={() => dialog.open()}>
  <Icon name="trash" />
  Delete
</Button>

<Dialog bind:this={dialog} onconfirm={onConfirm}>
  <span>Delete pick list?</span>
</Dialog>
