<script lang="ts">
  import { allianceTargets, blueTeamTargets, otherTargets, redTeamTargets, target } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
</script>

<Header />

<Container padding noGap>
  <Button iconName="list-ul" title="Surveys" disableTheme on:click={() => (location.hash = "/surveys")} />
  <Button iconName="ellipsis-vertical" title="Options" />
</Container>

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
