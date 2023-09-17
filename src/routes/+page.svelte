<script lang="ts">
  import { surveys } from "$lib/app";
  import "$lib/app.css";
  import Header from "$lib/components/Header.svelte";
  import EntryView from "$lib/views/EntryView.svelte";
  import OptionsView from "$lib/views/OptionsView.svelte";
  import SurveyConfigsView from "$lib/views/SurveyConfigsView.svelte";
  import SurveyEntriesView from "$lib/views/SurveyEntriesView.svelte";
  import SurveyOptionsView from "$lib/views/SurveyOptionsView.svelte";
  import SurveysView from "$lib/views/SurveysView.svelte";

  const mainViews = {
    surveys: SurveysView,
    options: OptionsView,
  };

  const surveyViews = {
    entries: SurveyEntriesView,
    configs: SurveyConfigsView,
    options: SurveyOptionsView,
  };

  let [mainView, surveyIndex, surveyView, entryIndex] = getHashRoute();
  onhashchange = () => ([mainView, surveyIndex, surveyView, entryIndex] = getHashRoute());

  function getHashRoute() {
    return location.hash
      .replaceAll("#/", "")
      .replaceAll("#", "")
      .split("/")
      .map((value) => {
        let parsed = parseInt(value);
        if (!Number.isNaN(parsed)) return parsed;
        return value;
      });
  }
</script>

{#if mainView == "surveys" || mainView == "options"}
  <Header />
  <svelte:component this={mainViews[mainView]} />
{:else if mainView == "survey" && typeof surveyIndex == "number" && surveyIndex >= 0 && surveyIndex < $surveys.length}
  {@const survey = $surveys[surveyIndex]}
  {#if surveyView == "entries" || surveyView == "configs" || surveyView == "options"}
    <Header title={survey.name} backLink={"/surveys"} />
    <svelte:component this={surveyViews[surveyView]} {surveyIndex} />
  {:else if surveyView == "entry" && typeof entryIndex == "number" && entryIndex >= 0 && entryIndex < survey.entries.length}
    <Header title="Entry ({survey.name})" backLink={`/survey/${surveyIndex}/entries`} />
    <EntryView {surveyIndex} {entryIndex} />
  {:else}
    <!-- Fallback -->
    <Header title={survey.name} backLink={"/surveys"} />
    <SurveyEntriesView {surveyIndex} />
  {/if}
{:else}
  <!-- Fallback -->
  <Header />
  <SurveysView />
{/if}
