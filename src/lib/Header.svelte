<script lang="ts">
  import Container from "./Container.svelte";
  import { location } from "./stores";

  export let title = "";
</script>

<svelte:head>
  <title>{title && `${title} | `} MeanScout</title>
</svelte:head>

<header>
  <Container>
    <slot><img id="logo" src="./logo.svg" alt="" /></slot>
    <h1>{title || "MeanScout"}</h1>
  </Container>
  <span class="theme-text">{$location}</span>
</header>
