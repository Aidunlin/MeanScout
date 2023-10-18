<script lang="ts">
  import { getStores } from "$lib";
  import "$lib/app.css";
  import Header from "$lib/components/Header.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
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
  {#if mainView == "survey" && typeof recordId == "number"}
    {#await surveyStore.get(recordId) then surveyRecord}
      <Header title={surveyRecord.name} backLink="surveys" />
      <NavBar
        currentHash={surveyView}
        baseHash="survey/{surveyRecord.id}"
        links={[
          { hash: "entries", iconName: "list-ol", title: "Entries" },
          { hash: "configs", iconName: "gears", title: "Configs" },
          { hash: "options", iconName: "ellipsis-vertical", title: "Options" },
        ]}
      />

      {#await entryStore.getAllWithSurveyId(surveyRecord.id) then entryRecords}
        {#if surveyView == "configs"}
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
    <Header />
    <NavBar
      currentHash={mainView}
      links={[
        { hash: "surveys", iconName: "list-ul", title: "Surveys" },
        { hash: "options", iconName: "ellipsis-vertical", title: "Options" },
      ]}
    />

    {#if mainView == "options"}
      <OptionsView />
    {:else}
      {#await surveyStore.getAll() then surveyRecords}
        <SurveysView {surveyStore} {surveyRecords} {entryStore} />
      {/await}
    {/if}
  {/if}
{:catch error}
  <p>
    MeanScout was unable to access IndexedDB. Double check that your device/browser supports it, and that you haven't
    removed the permission to access it.
  </p>
  <p>Error: {error}</p>
{/await}
