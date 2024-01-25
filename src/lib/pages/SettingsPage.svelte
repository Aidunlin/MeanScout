<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import EditTBAKeyDialog from "$lib/dialogs/EditTBAKeyDialog.svelte";
  import { targets, targetStore } from "$lib/target";
</script>

<Header backLink="" title="Settings" iconName="gears" />

<Container padding="large">
  <Container direction="column" gap="none">
    Target
    <select bind:value={$targetStore} title="Target">
      {#each targets as target}
        <option>{target}</option>
      {/each}
    </select>
  </Container>
</Container>

{#if navigator.onLine}
  <Container direction="column" padding="large">
    <h2>The Blue Alliance</h2>
    <EditTBAKeyDialog />
  </Container>
{/if}
