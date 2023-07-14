<script lang="ts">
  import { location } from "../app";
  import Button from "./Button.svelte";
  import Container from "./Container.svelte";

  export let title = "";
  export let backLink: string | undefined = undefined;
</script>

<svelte:head>
  <title>{title && `${title} | `} MeanScout</title>
</svelte:head>

<header>
  <Container>
    {#if backLink != undefined}
      <Button
        iconName="arrow-left"
        title="Go back"
        on:click={() => {
          if (backLink != undefined) window.location.hash = backLink;
        }}
      />
    {:else}
      <img id="logo" src="./logo.svg" alt="" />
    {/if}
    <h1>{title || "MeanScout"}</h1>
  </Container>
  <span class="theme-text">{$location}</span>
</header>
