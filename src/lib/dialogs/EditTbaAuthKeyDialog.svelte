<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { tbaAuthKeyStore } from "$lib/settings";
  import { tbaAuthKeyIsValid } from "$lib/tba";

  let dialog: Dialog;
  let tbaAuthKey = $tbaAuthKeyStore;
  let error = "";

  async function onConfirm() {
    tbaAuthKey = tbaAuthKey.trim();

    if (!tbaAuthKey) {
      $tbaAuthKeyStore = tbaAuthKey;
      dialog.close();
      return;
    }

    if (await tbaAuthKeyIsValid(tbaAuthKey)) {
      $tbaAuthKeyStore = tbaAuthKey;
      dialog.close();
    } else {
      error = `unauthorized!`;
    }
  }
</script>

<Dialog
  bind:this={dialog}
  {onConfirm}
  on:close={() => {
    tbaAuthKey = $tbaAuthKeyStore;
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      {#if $tbaAuthKeyStore}
        <Icon name="pen" />
        Edit API auth key
      {:else}
        <Icon name="plus" />
        Add API auth key
      {/if}
    </Container>
  </Button>

  <span>
    {#if $tbaAuthKeyStore}
      Edit TBA API auth key
    {:else}
      Add TBA API auth key
    {/if}
  </span>
  <input bind:value={tbaAuthKey} title="TBA Key" />
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
