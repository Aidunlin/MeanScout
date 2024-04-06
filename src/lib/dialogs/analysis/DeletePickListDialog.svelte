<script lang="ts">
  import { type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let surveyRecord: IDBRecord<Survey>;
  export let pickListIndex: number;

  let dialog: Dialog;

  function onConfirm() {
    surveyRecord.pickLists = surveyRecord.pickLists.toSpliced(pickListIndex, 1);
    surveyRecord.modified = new Date();
    dialog.close();
  }
</script>

<Dialog bind:this={dialog} {onConfirm}>
  <Button slot="opener" let:open on:click={open}>
    <Icon name="trash" />
    Delete
  </Button>

  <span>Delete pick list?</span>
</Dialog>
