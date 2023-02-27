<script lang="ts">
  import "$lib/app.css";
  import { indexes } from "$lib/app";
  import EntryPage from "./EntryPage.svelte";
  import MainPage from "./MainPage.svelte";
  import SurveyPage from "./SurveyPage.svelte";
</script>

{#if $indexes.survey == undefined}
  <MainPage />
{:else if $indexes.entry == undefined}
  <SurveyPage surveyIndex={$indexes.survey} />
{:else}
  <EntryPage surveyIndex={$indexes.survey} entryIndex={$indexes.entry} />
{/if}
