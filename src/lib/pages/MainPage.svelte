<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import MainOptionsView from "$lib/views/MainOptionsView.svelte";
  import MainSurveysView from "$lib/views/MainSurveysView.svelte";

  export let view: "surveys" | "options" = "surveys";
  export let idb: IDBDatabase;
</script>

<Header />
<NavBar
  currentHash={view}
  baseHash="main"
  links={[
    { hash: "surveys", iconName: "list-ul", text: "Surveys" },
    { hash: "options", iconName: "gears", text: "Options" },
  ]}
/>

{#if view == "surveys"}
  <MainSurveysView {idb} />
{:else if view == "options"}
  <MainOptionsView />
{/if}
