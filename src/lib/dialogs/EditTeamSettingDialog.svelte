<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { teamStore } from "$lib/settings";

  let dialog: Dialog;
  let teamInput = $teamStore;
  let error = "";

  function onConfirm() {
    const team = teamInput.trim();
    if (team && !/^\d{1,5}[A-Z]?$/.test(team)) {
      error = "invalid team!";
      return;
    }

    $teamStore = team;
    dialog.close();
  }
</script>

<Dialog
  bind:this={dialog}
  {onConfirm}
  on:close={() => {
    teamInput = $teamStore;
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
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

  <span>
    {#if $teamStore}
      Edit team
    {:else}
      Add team
    {/if}
  </span>
  <input bind:value={teamInput} title="TBA Key" />
  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
