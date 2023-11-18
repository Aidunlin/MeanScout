<script lang="ts">
  import type { IDBRecord, Survey } from "$lib";
  import Header from "$lib/components/Header.svelte";
  import SurveyEntriesView from "$lib/views/SurveyEntriesView.svelte";
  import SurveyFieldsView from "$lib/views/SurveyFieldsView.svelte";
  import SurveyOptionsView from "$lib/views/SurveyOptionsView.svelte";

  export let view: "entries" | "fields" | "options" = "entries";
  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);
</script>

<Header
  breadcrumbs={[{ text: surveyRecord.name, iconName: "list-ul" }]}
  views={[
    { text: "Entries", iconName: "list-ol", hash: "entries" },
    { text: "Fields", iconName: "list-check", hash: "fields" },
    { text: "Options", iconName: "gears", hash: "options" },
  ]}
  currentView={view}
  baseHash="survey/{surveyRecord.id}"
/>

{#if view == "entries"}
  <SurveyEntriesView {idb} bind:surveyRecord />
{:else if view == "fields"}
  <SurveyFieldsView {idb} bind:surveyRecord />
{:else if view == "options"}
  <SurveyOptionsView {idb} bind:surveyRecord />
{/if}
