<script lang="ts">
  import "$lib/app.css";
  import { onMount } from "svelte";

  onMount(() => document.body.classList.remove("hide"));
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<slot />
