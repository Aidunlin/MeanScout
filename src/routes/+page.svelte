<script lang="ts">
  import { SurveyStore, openIDB } from "$lib/app";
  import "$lib/app.css";
  import EntryView from "$lib/views/EntryView.svelte";
  import OptionsView from "$lib/views/OptionsView.svelte";
  import SurveyConfigsView from "$lib/views/SurveyConfigsView.svelte";
  import SurveyEntriesView from "$lib/views/SurveyEntriesView.svelte";
  import SurveyOptionsView from "$lib/views/SurveyOptionsView.svelte";
  import SurveysView from "$lib/views/SurveysView.svelte";

  let [mainView, surveyId, surveyView, entryId] = getHashRoute();
  onhashchange = () => ([mainView, surveyId, surveyView, entryId] = getHashRoute());

  function getHashRoute() {
    return location.hash
      .replaceAll("#/", "")
      .replaceAll("#", "")
      .split("/")
      .map((value) => {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) return parsed;
        return value;
      });
  }

  async function getSurveyStore() {
    return new SurveyStore(await openIDB());
  }
</script>

{#await getSurveyStore() then surveyStore}
  {#if mainView == "surveys"}
    <SurveysView {surveyStore} />
  {:else if mainView == "options"}
    <OptionsView />
  {:else if mainView == "survey" && typeof surveyId == "number"}
    {#await surveyStore.get(surveyId) then survey}
      {#if surveyView == "entries"}
        <SurveyEntriesView {surveyStore} {survey} />
      {:else if surveyView == "configs"}
        <SurveyConfigsView {surveyStore} {survey} />
      {:else if surveyView == "options"}
        <SurveyOptionsView {surveyStore} {survey} />
      {:else if surveyView == "entry" && typeof entryId == "number"}
        <EntryView {surveyStore} {survey} {entryId} />
      {:else}
        <SurveyEntriesView {surveyStore} {survey} />
      {/if}
    {/await}
  {:else}
    <SurveysView {surveyStore} />
  {/if}
{/await}
