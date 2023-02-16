<script lang="ts">
  import { onMount } from "svelte";
  import MenuBar from "./MenuBar.svelte";
  import Menu from "./Menu.svelte";
  import DefaultMetrics from "./DefaultMetrics.svelte";
  import CustomMetrics from "./CustomMetrics.svelte";
  import SurveyBar from "./SurveyBar.svelte";

  onMount(() => document.body.classList.remove("hide"));
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<MenuBar />
<Menu />
<DefaultMetrics />
<CustomMetrics />
<SurveyBar />
