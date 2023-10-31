<script lang="ts">
  import type { Survey } from "$lib";
  import Header from "$lib/components/Header.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import type { EntryStore, IDBRecord, SurveyStore } from "$lib/db";
  import SurveyConfigsView from "../views/SurveyConfigsView.svelte";
  import SurveyEntriesView from "../views/SurveyEntriesView.svelte";
  import SurveyOptionsView from "../views/SurveyOptionsView.svelte";

  export let dir: any;
  export let surveyStore: SurveyStore;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryStore: EntryStore;
</script>

<Header title={surveyRecord.name} backLink="surveys" />
<NavBar
  currentHash={dir}
  baseHash="survey/{surveyRecord.id}"
  links={[
    { hash: "entries", iconName: "list-ol", title: "Entries" },
    { hash: "configs", iconName: "gears", title: "Configs" },
    { hash: "options", iconName: "ellipsis-vertical", title: "Options" },
  ]}
/>

{#await entryStore.getAllWithSurveyId(surveyRecord.id) then entryRecords}
  {#if dir == "configs"}
    <SurveyConfigsView {surveyStore} {surveyRecord} disabled={entryRecords.length > 0} />
  {:else if dir == "options"}
    <SurveyOptionsView {surveyStore} {surveyRecord} {entryStore} />
  {:else}
    <SurveyEntriesView {surveyStore} {surveyRecord} {entryStore} {entryRecords} />
  {/if}
{/await}
