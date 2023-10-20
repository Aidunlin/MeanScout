<script lang="ts">
  import "$lib/app.css";
  import Header from "$lib/components/Header.svelte";
  import { getStores, getEntryWithSurvey } from "$lib/db";
  import EntryPage from "$lib/pages/EntryPage.svelte";
  import MainPage from "$lib/pages/MainPage.svelte";
  import SurveyPage from "$lib/pages/SurveyPage.svelte";

  let [dir, recordId, surveyDir] = getHashRoute();
  onhashchange = () => ([dir, recordId, surveyDir] = getHashRoute());

  function getHashRoute() {
    const hash = location.hash.replace(/#\/?/, "").toLowerCase().trim();

    return hash.split("/").map((value) => {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
      return value;
    });
  }
</script>

{#await getStores() then { surveyStore, entryStore }}
  {#if dir == "survey" && typeof recordId == "number"}
    {#await surveyStore.get(recordId) then surveyRecord}
      <SurveyPage dir={surveyDir} {surveyStore} {surveyRecord} {entryStore} />
    {:catch}
      <MainPage dir="surveys" {surveyStore} {entryStore} />
    {/await}
  {:else if dir == "entry" && typeof recordId == "number"}
    {#await getEntryWithSurvey(recordId, surveyStore, entryStore) then { surveyRecord, entryRecord }}
      <EntryPage {surveyRecord} {entryStore} {entryRecord} />
    {:catch}
      <MainPage dir="surveys" {surveyStore} {entryStore} />
    {/await}
  {:else}
    <MainPage {dir} {surveyStore} {entryStore} />
  {/if}
{:catch error}
  <Header />
  <h2>Error</h2>
  <p>
    MeanScout was unable to access IndexedDB. Double check that your device/browser supports it, and that you haven't
    removed the permission to access it.
  </p>
  <p>Error: {error}</p>
{/await}
