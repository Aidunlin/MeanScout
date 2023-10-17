<script lang="ts">
  import { getStores } from "$lib/app";
  import "$lib/app.css";
  import EntryView from "$lib/views/EntryView.svelte";
  import OptionsView from "$lib/views/OptionsView.svelte";
  import SurveyConfigsView from "$lib/views/SurveyConfigsView.svelte";
  import SurveyEntriesView from "$lib/views/SurveyEntriesView.svelte";
  import SurveyOptionsView from "$lib/views/SurveyOptionsView.svelte";
  import SurveysView from "$lib/views/SurveysView.svelte";

  let [mainView, recordId, surveyView] = getHashRoute();
  onhashchange = () => ([mainView, recordId, surveyView] = getHashRoute());

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
</script>

{#await getStores() then { surveyStore, entryStore }}
  {#if mainView == "surveys"}
    {#await surveyStore.getAll() then surveyRecords}
      <SurveysView {surveyStore} {surveyRecords} {entryStore} />
    {/await}
  {:else if mainView == "options"}
    <OptionsView />
  {:else if mainView == "survey" && typeof recordId == "number"}
    {#await surveyStore.get(recordId) then surveyRecord}
      {#await entryStore.getAllWithSurveyId(surveyRecord.id) then entryRecords}
        {#if surveyView == "entries"}
          <SurveyEntriesView {surveyStore} {surveyRecord} {entryStore} {entryRecords} />
        {:else if surveyView == "configs"}
          <SurveyConfigsView {surveyStore} {surveyRecord} disabled={entryRecords.length > 0} />
        {:else if surveyView == "options"}
          <SurveyOptionsView {surveyStore} {surveyRecord} />
        {:else}
          <SurveyEntriesView {surveyStore} {surveyRecord} {entryStore} {entryRecords} />
        {/if}
      {/await}
    {/await}
  {:else if mainView == "entry" && typeof recordId == "number"}
    {#await entryStore.get(recordId) then entryRecord}
      {#await surveyStore.get(entryRecord.surveyId) then surveyRecord}
        <EntryView {surveyRecord} {entryStore} {entryRecord} />
      {/await}
    {/await}
  {:else}
    {#await surveyStore.getAll() then surveyRecords}
      <SurveysView {surveyStore} {surveyRecords} {entryStore} />
    {/await}
  {/if}
{/await}
