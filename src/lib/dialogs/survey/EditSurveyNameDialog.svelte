<script lang="ts">
  import type { Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let surveyRecord: IDBRecord<Survey>;

  let dialog: Dialog;
  let name = surveyRecord.name;
  let error = "";

  function onConfirm() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      error = "Name can't be blank!";
      return;
    }

    surveyRecord.name = trimmedName;
    dialog.close();
  }
</script>

<Dialog
  bind:this={dialog}
  {onConfirm}
  on:close={() => {
    name = surveyRecord.name;
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="pen" />
      Edit name: {surveyRecord.name}
    </Container>
  </Button>

  <span>Edit name:</span>
  <input bind:value={name} />
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
