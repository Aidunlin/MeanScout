<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import { targets, targetStore } from "$lib/target";
</script>

<Container column padding>
  <h2>Options</h2>
  <Container>
    <Container column noGap>
      Target
      <select bind:value={$targetStore} title="Target">
        {#each targets as target}
          <option>{target}</option>
        {/each}
      </select>
    </Container>
  </Container>
</Container>
