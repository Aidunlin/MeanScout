<script lang="ts">
  import type { Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  let {
    surveyRecord = $bindable(),
  }: {
    surveyRecord: IDBRecord<Survey>;
  } = $props();

  let dialog: Dialog;

  let name = $state(surveyRecord.name);
  let error = $state("");

  function onconfirm() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      error = "Name can't be blank!";
      return;
    }

    surveyRecord.name = trimmedName;
    dialog.close();
  }

  function onclose() {
    name = surveyRecord.name;
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Container maxWidth>
    <Icon name="pen" />
    Edit name: {surveyRecord.name}
  </Container>
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  <span>Edit name:</span>
  <input bind:value={name} />
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
