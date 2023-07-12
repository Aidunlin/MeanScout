<script lang="ts">
  import { indexes, mainPage, surveyPage } from "$lib/app";
  import "$lib/app.css";
  import EntryPage from "./EntryPage.svelte";
  import MainOptions from "./MainOptions.svelte";
  import MainPage from "./MainPage.svelte";
  import SurveyConfigs from "./SurveyConfigs.svelte";
  import SurveyOptions from "./SurveyOptions.svelte";
  import SurveyPage from "./SurveyPage.svelte";

  const mainPages = {
    surveys: MainPage,
    options: MainOptions,
  };

  const surveyPages = {
    entries: SurveyPage,
    configs: SurveyConfigs,
    options: SurveyOptions,
  };
</script>

{#if $indexes.survey == undefined}
  <svelte:component this={mainPages[$mainPage]} />
{:else if $indexes.entry == undefined}
  <svelte:component this={surveyPages[$surveyPage]} surveyIndex={$indexes.survey} />
{:else}
  <EntryPage surveyIndex={$indexes.survey} entryIndex={$indexes.entry} />
{/if}
