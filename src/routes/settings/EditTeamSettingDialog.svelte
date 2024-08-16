<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { teamStore } from "$lib/settings";

  let dialog: Dialog;
  let teamInput = $state($teamStore);
  let error = $state("");

  function onconfirm() {
    teamInput = teamInput.trim();
    if (teamInput && !/^\d{1,5}[A-Z]?$/.test(teamInput)) {
      error = "invalid team!";
      return;
    }

    $teamStore = teamInput;
    dialog.close();
  }

  function onclose() {
    teamInput = $teamStore;
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Container maxWidth>
    {#if $teamStore}
      <Icon name="pen" />
      Edit team: {$teamStore}
    {:else}
      <Icon name="plus" />
      Add team
    {/if}
  </Container>
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  <span>
    {#if $teamStore}
      Edit team
    {:else}
      Add team
    {/if}
  </span>
  <input bind:value={teamInput} />
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
