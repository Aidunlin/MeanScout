<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import MainOptionsView from "$lib/views/MainOptionsView.svelte";
  import MainSurveysView from "$lib/views/MainSurveysView.svelte";

  export let view: "surveys" | "options" = "surveys";
  export let idb: IDBDatabase;
</script>

<Header
  views={[
    { text: "Surveys", iconName: "list-ul", hash: "surveys" },
    { text: "Options", iconName: "gears", hash: "options" },
  ]}
  currentView={view}
  baseHash="main"
/>

{#if view == "surveys"}
  <MainSurveysView {idb} />
{:else if view == "options"}
  <MainOptionsView />
{/if}
