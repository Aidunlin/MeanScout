<script lang="ts">
  import { allianceTargets, blueTeamTargets, otherTargets, redTeamTargets, target } from "$lib/app";
  import Container from "$lib/components/Container.svelte";
</script>

<Container column padding>
  <h2>Options</h2>
  <Container>
    <Container column noGap>
      Target
      <select bind:value={$target} title="Target">
        <optgroup label="Alliances">
          {#each allianceTargets as alliance}
            <option>{alliance}</option>
          {/each}
        </optgroup>
        <optgroup label="Teams">
          {#each [...redTeamTargets, ...blueTeamTargets] as team}
            <option>{team}</option>
          {/each}
        </optgroup>
        <optgroup label="Other">
          {#each otherTargets as other}
            <option>{other}</option>
          {/each}
        </optgroup>
      </select>
    </Container>
  </Container>
</Container>
