<script lang="ts">
  import { surveys } from "$lib/app";
  import "$lib/app.css";
  import EntryView from "$lib/views/EntryView.svelte";
  import OptionsView from "$lib/views/OptionsView.svelte";
  import SurveyConfigsView from "$lib/views/SurveyConfigsView.svelte";
  import SurveyEntriesView from "$lib/views/SurveyEntriesView.svelte";
  import SurveyOptionsView from "$lib/views/SurveyOptionsView.svelte";
  import SurveysView from "$lib/views/SurveysView.svelte";

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

{#if mainView == "surveys"}
  <SurveysView />
{:else if mainView == "options"}
  <OptionsView />
{:else if mainView == "survey" && typeof surveyIndex == "number" && surveyIndex >= 0 && surveyIndex < $surveys.length}
  {#if surveyView == "entries"}
    <SurveyEntriesView {surveyIndex} />
  {:else if surveyView == "configs"}
    <SurveyConfigsView {surveyIndex} />
  {:else if surveyView == "options"}
    <SurveyOptionsView {surveyIndex} />
  {:else if surveyView == "entry" && typeof entryIndex == "number" && entryIndex >= 0 && entryIndex < $surveys[surveyIndex].entries.length}
    <EntryView {surveyIndex} {entryIndex} />
  {:else}
    <SurveyEntriesView {surveyIndex} />
  {/if}
{:else}
  <SurveysView />
{/if}
