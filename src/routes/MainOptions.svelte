<script lang="ts">
  import { location, locations } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
</script>

<Container padding noGap>
  <Button iconName="list-ul" title="Surveys" disableTheme on:click={() => (window.location.hash = "")} />
  <Button iconName="ellipsis-vertical" title="Options" />
</Container>

<Container column padding>
  <h2>Options</h2>
  <Container>
    <Container column noGap>
      Location
      <select bind:value={$location} title="Location">
        {#each Object.values(locations) as location}
          <option>{location}</option>
        {/each}
      </select>
    </Container>
  </Container>
</Container>
