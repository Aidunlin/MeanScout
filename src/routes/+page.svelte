<script lang="ts">
  import { onMount } from "svelte";
  import Menu from "./Menu.svelte";
  import Survey from "./Survey.svelte";

  onMount(() => document.body.classList.remove("hide"));
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<Menu />
<Survey />
