<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import type { EntryStore, SurveyStore } from "$lib/db";
  import MainOptionsView from "../views/MainOptionsView.svelte";
  import MainSurveysView from "../views/MainSurveysView.svelte";

  export let dir: any;
  export let surveyStore: SurveyStore;
  export let entryStore: EntryStore;
</script>

<Header />
<NavBar
  currentHash={dir}
  links={[
    { hash: "surveys", iconName: "list-ul", title: "Surveys" },
    { hash: "options", iconName: "ellipsis-vertical", title: "Options" },
  ]}
/>

{#if dir == "options"}
  <MainOptionsView />
{:else}
  {#await surveyStore.getAll() then surveyRecords}
    <MainSurveysView {surveyStore} {surveyRecords} {entryStore} />
  {/await}
{/if}
