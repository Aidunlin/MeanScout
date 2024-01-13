<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import { targets, targetStore } from "$lib/target";
</script>

<Header current={{ text: "Options", iconName: "gears" }} />

<Container column padding>
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
