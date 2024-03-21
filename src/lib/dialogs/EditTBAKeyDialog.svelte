<script lang="ts">
  import { fetchTBA } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { tbaKeyStore } from "$lib/settings";

  let dialog: Dialog;
  let tbaKeyInput = $tbaKeyStore;
  let error = "";

  function onConfirm() {
    const tbaKey = tbaKeyInput.trim();

    if (!tbaKey) {
      $tbaKeyStore = tbaKey;
      dialog.close();
      return;
    }

    if (!navigator.onLine) {
      error = "offline!";
      return;
    }

    fetchTBA("/status", tbaKeyInput)
      .then((response) => {
        if (response.status == "success") {
          $tbaKeyStore = tbaKeyInput;
          dialog.close();
        } else {
          error = `${response.status}!`;
        }
      })
      .catch(() => (error = "error!"));
  }
</script>

<Dialog
  bind:this={dialog}
  {onConfirm}
  on:close={() => {
    tbaKeyInput = $tbaKeyStore;
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="pen" />
      {#if $tbaKeyStore}
        Edit
      {:else}
        Enter your
      {/if} API key
    </Container>
  </Button>

  <span>Edit API key:</span>
  <input bind:value={tbaKeyInput} title="TBA Key" />
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
