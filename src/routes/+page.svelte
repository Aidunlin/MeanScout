<script lang="ts">
  import { surveys } from "$lib/app";
  import "$lib/app.css";
  import Header from "$lib/components/Header.svelte";
  import EntryPage from "./EntryPage.svelte";
  import MainOptions from "./MainOptions.svelte";
  import MainPage from "./MainPage.svelte";
  import SurveyConfigs from "./SurveyConfigs.svelte";
  import SurveyOptions from "./SurveyOptions.svelte";
  import SurveyPage from "./SurveyPage.svelte";

  export const mainPages = {
    "": MainPage,
    options: MainOptions,
  };

  export const surveyPages = {
    "": SurveyPage,
    configs: SurveyConfigs,
    options: SurveyOptions,
  };

  type HashRoute = [keyof typeof mainPages] | [number, keyof typeof surveyPages | number];

  let hashRoute: HashRoute = [""];

  function getHashRoute() {
    hashRoute = window.location.hash
      .replace("#", "")
      .split("/")
      .map((value) => {
        let parsed = parseInt(value);
        if (!Number.isNaN(parsed)) return parsed;
        return value;
      }) as HashRoute;
  }

  window.onhashchange = getHashRoute;
  getHashRoute();
</script>

{#if typeof hashRoute[0] == "string"}
  <Header />
  <svelte:component this={mainPages[hashRoute[0]]} />
{:else if typeof hashRoute[0] == "number" && typeof hashRoute[1] != "number"}
  <Header title={$surveys[hashRoute[0]].name} backLink={""} />
  <svelte:component this={surveyPages[hashRoute[1] ?? ""]} surveyIndex={hashRoute[0]} />
{:else if typeof hashRoute[1] == "number"}
  <Header title="Entry ({$surveys[hashRoute[0]].name})" backLink={`${hashRoute[0]}`} />
  <EntryPage surveyIndex={hashRoute[0]} entryIndex={hashRoute[1]} />
{/if}
