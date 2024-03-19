<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import EditTBAKeyDialog from "$lib/dialogs/EditTBAKeyDialog.svelte";
  import { modes, modeStore } from "$lib/mode";
  import { targets, targetStore } from "$lib/target";
</script>

<Header backLink="" title="Settings" iconName="gears" />

<Container padding="large">
  <h2>Scouting Target</h2>
  <Container direction="column" gap="none">
    Target
    <select bind:value={$targetStore} title="Target" disabled={$modeStore == "scout"}>
      {#each targets as target}
        <option>{target}</option>
      {/each}
    </select>
  </Container>

  <h2>Settings</h2>
  <Container direction="column" gap="none">
    Mode
    <select bind:value={$modeStore}>
      {#each modes as mode}
        <option>{mode}</option>
      {/each}
    </select>
  </Container>
</Container>

{#if navigator.onLine && $modeStore == "admin"}
  <Container direction="column" padding="large">
    <h2>The Blue Alliance</h2>
    <EditTBAKeyDialog />
  </Container>
{/if}
