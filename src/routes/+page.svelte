<script lang="ts">
  import "$lib/app.css";
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

  type HashParams = [keyof typeof mainPages] | [number, keyof typeof surveyPages | number];

  let hashParams: HashParams = [""];

  function getHashParams() {
    hashParams = window.location.hash
      .replace("#", "")
      .split("/")
      .map((value) => {
        let parsed = parseInt(value);
        if (!Number.isNaN(parsed)) return parsed;
        return value;
      }) as HashParams;
  }

  window.onhashchange = getHashParams;
  getHashParams();
</script>

{#if typeof hashParams[0] == "string"}
  <svelte:component this={mainPages[hashParams[0]]} />
{:else if typeof hashParams[0] == "number" && typeof hashParams[1] != "number"}
  <svelte:component this={surveyPages[hashParams[1] ?? ""]} surveyIndex={hashParams[0]} />
{:else if typeof hashParams[1] == "number"}
  <EntryPage surveyIndex={hashParams[0]} entryIndex={hashParams[1]} />
{/if}
