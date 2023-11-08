<script lang="ts">
  import type { IDBRecord, Survey } from "$lib";
  import Header from "$lib/components/Header.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import SurveyConfigsView from "$lib/views/SurveyConfigsView.svelte";
  import SurveyEntriesView from "$lib/views/SurveyEntriesView.svelte";
  import SurveyOptionsView from "$lib/views/SurveyOptionsView.svelte";

  export let view: "entries" | "configs" | "options" = "entries";
  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);
</script>

<Header title={surveyRecord.name} backLink="main/surveys" />
<NavBar
  currentHash={view}
  baseHash="survey/{surveyRecord.id}"
  links={[
    { hash: "entries", iconName: "list-ol", title: "Entries" },
    { hash: "configs", iconName: "gears", title: "Configs" },
    { hash: "options", iconName: "ellipsis-vertical", title: "Options" },
  ]}
/>

{#if view == "entries"}
  <SurveyEntriesView {idb} bind:surveyRecord />
{:else if view == "configs"}
  <SurveyConfigsView {idb} bind:surveyRecord />
{:else if view == "options"}
  <SurveyOptionsView {idb} bind:surveyRecord />
{/if}
