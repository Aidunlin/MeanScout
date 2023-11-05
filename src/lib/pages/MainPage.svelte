<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import MainOptionsView from "../views/MainOptionsView.svelte";
  import MainSurveysView from "../views/MainSurveysView.svelte";

  export let dir: "surveys" | "options" = "surveys";
  export let idb: IDBDatabase;
</script>

<Header />
<NavBar
  currentHash={dir}
  baseHash="main"
  links={[
    { hash: "surveys", iconName: "list-ul", title: "Surveys" },
    { hash: "options", iconName: "ellipsis-vertical", title: "Options" },
  ]}
/>

{#if dir == "surveys"}
  <MainSurveysView {idb} />
{:else if dir == "options"}
  <MainOptionsView />
{/if}
