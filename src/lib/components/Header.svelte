<script lang="ts">
  import { target } from "../app";
  import Anchor from "./Anchor.svelte";
  import Container from "./Container.svelte";

  export let title = "";
  export let backLink = "";
</script>

<svelte:head>
  <title>{title && `${title} | `} MeanScout</title>
</svelte:head>

<header>
  <Container>
    {#if backLink}
      <Anchor hash={backLink} iconName="arrow-left" title="Go back" />
    {:else}
      <img id="logo" src="./logo.svg" alt="" />
    {/if}
    <h1>{title || "MeanScout"}</h1>
  </Container>
  <span class="theme-text" style="text-transform:capitalize">{$target}</span>
</header>
