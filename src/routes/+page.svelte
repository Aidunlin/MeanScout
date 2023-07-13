<script lang="ts">
  import { mainPages, routes, surveyPages } from "$lib/app";
  import "$lib/app.css";
  import EntryPage from "./EntryPage.svelte";
</script>

{#if typeof $routes[0] == "string"}
  <svelte:component this={mainPages[$routes[0]]} />
{:else if typeof $routes[1] == "string"}
  <svelte:component this={surveyPages[$routes[1]]} surveyIndex={$routes[0]} />
{:else}
  <EntryPage surveyIndex={$routes[0]} entryIndex={$routes[1]} />
{/if}
