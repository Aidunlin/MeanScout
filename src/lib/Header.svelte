<script lang="ts">
  import { location } from "./stores";

  export let title = "";
</script>

<svelte:head>
  <title>{title && `${title} | `} MeanScout</title>
</svelte:head>

<header>
  <div class="flex-row">
    <slot><img id="logo" src="./logo.svg" alt="" /></slot>
    <h1>{title || "MeanScout"}</h1>
  </div>
  <span class="theme-text">{$location}</span>
</header>
