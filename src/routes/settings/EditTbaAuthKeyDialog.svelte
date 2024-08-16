<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { tbaAuthKeyStore } from "$lib/settings";
  import { tbaAuthKeyIsValid } from "$lib/tba";

  let dialog: Dialog;
  let tbaAuthKey = $state($tbaAuthKeyStore);
  let error = $state("");

  async function onconfirm() {
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

  function onclose() {
    tbaAuthKey = $tbaAuthKeyStore;
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
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

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  <span>
    {#if $tbaAuthKeyStore}
      Edit TBA API auth key
    {:else}
      Add TBA API auth key
    {/if}
  </span>
  <input bind:value={tbaAuthKey} />
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
