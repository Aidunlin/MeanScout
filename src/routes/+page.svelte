<script lang="ts">
  import { indexes, mainPage, mainPages, surveyPage, surveyPages } from "$lib/app";
  import "$lib/app.css";
  import EntryPage from "./EntryPage.svelte";
</script>

{#if $indexes.survey == undefined}
  <svelte:component this={mainPages[$mainPage]} />
{:else if $indexes.entry == undefined}
  <svelte:component this={surveyPages[$surveyPage]} surveyIndex={$indexes.survey} />
{:else}
  <EntryPage surveyIndex={$indexes.survey} entryIndex={$indexes.entry} />
{/if}
