<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import EditTbaAuthKeyDialog from "./EditTbaAuthKeyDialog.svelte";
  import EditTeamSettingDialog from "./EditTeamSettingDialog.svelte";
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
      <select bind:value={$targetStore} disabled={$modeStore == "scout"}>
        {#each targets as target}
          <option>{target}</option>
        {/each}
      </select>
    </Container>
  </Container>
  {#if $modeStore == "admin"}
    <h2>Team</h2>
    <EditTeamSettingDialog />
    <h2>The Blue Alliance</h2>
    <EditTbaAuthKeyDialog />
  {/if}
</Container>
