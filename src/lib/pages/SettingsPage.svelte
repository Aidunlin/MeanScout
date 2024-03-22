<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import EditTBAKeyDialog from "$lib/dialogs/EditTBAKeyDialog.svelte";
  import EditTeamSettingDialog from "$lib/dialogs/EditTeamSettingDialog.svelte";
  import { modes, modeStore, targets, targetStore } from "$lib/settings";
</script>

<Header backLink="" title="Settings" iconName="gears" />

<Container direction="column" padding="large">
  <h2>Settings</h2>
  <Container>
    <Container direction="column" gap="none">
      Mode
      <select bind:value={$modeStore}>
        {#each modes as mode}
          <option>{mode}</option>
        {/each}
      </select>
    </Container>
  </Container>
  <Container>
    <Container direction="column" gap="none">
      Target
      <select bind:value={$targetStore} title="Target" disabled={$modeStore == "scout"}>
        {#each targets as target}
          <option>{target}</option>
        {/each}
      </select>
    </Container>
  </Container>
  {#if $modeStore == "admin"}
    <h2>Team</h2>
    <EditTeamSettingDialog />
    {#if navigator.onLine}
      <h2>The Blue Alliance</h2>
      <EditTBAKeyDialog />
    {/if}
  {/if}
</Container>
