<script lang="ts">
  import { onMount } from "svelte";
  import EntryEditor from "./EntryEditor.svelte";
  import Menu from "./Menu.svelte";

  onMount(() => document.body.classList.remove("hide"));
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<Menu />
<EntryEditor />
