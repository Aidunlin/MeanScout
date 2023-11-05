<script lang="ts">
  import type { IDBRecord, Survey } from "$lib";
  import Header from "$lib/components/Header.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import SurveyConfigsView from "../views/SurveyConfigsView.svelte";
  import SurveyEntriesView from "../views/SurveyEntriesView.svelte";
  import SurveyOptionsView from "../views/SurveyOptionsView.svelte";

  export let dir: "entries" | "configs" | "options" = "entries";
  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
</script>

<Header title={surveyRecord.name} backLink="main/surveys" />
<NavBar
  currentHash={dir}
  baseHash="survey/{surveyRecord.id}"
  links={[
    { hash: "entries", iconName: "list-ol", title: "Entries" },
    { hash: "configs", iconName: "gears", title: "Configs" },
    { hash: "options", iconName: "ellipsis-vertical", title: "Options" },
  ]}
/>

{#if dir == "entries"}
  <SurveyEntriesView {idb} {surveyRecord} />
{:else if dir == "configs"}
  <SurveyConfigsView {idb} {surveyRecord} />
{:else if dir == "options"}
  <SurveyOptionsView {idb} {surveyRecord} />
{/if}
