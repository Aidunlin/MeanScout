<script lang="ts">
  import { location, locations, mainPage } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
</script>

<Header />

<Container padding noGap>
  <Button iconName="list-ul" title="Surveys" disableTheme on:click={() => ($mainPage = "surveys")} />
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
