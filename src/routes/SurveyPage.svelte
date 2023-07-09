<script lang="ts">
  import { indexes, surveys, surveySubPage } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import SurveyConfigs from "./SurveyConfigs.svelte";
  import SurveyEntries from "./SurveyEntries.svelte";
  import SurveyOptions from "./SurveyOptions.svelte";

  export let surveyIndex: number;
</script>

<Header title={$surveys[surveyIndex].name}>
  <Button iconName="arrow-left" title="Back to surveys" on:click={() => ($indexes.survey = undefined)} />
</Header>

<Container padding noGap>
  <Button
    iconName="list-ol"
    title="Entries"
    disableTheme={$surveySubPage != "entries"}
    on:click={() => ($surveySubPage = "entries")}
  />
  <Button
    iconName="gears"
    title="Configs"
    disableTheme={$surveySubPage != "configs"}
    on:click={() => ($surveySubPage = "configs")}
  />
  <Button
    iconName="ellipsis-vertical"
    title="Options"
    disableTheme={$surveySubPage != "options"}
    on:click={() => ($surveySubPage = "options")}
  />
</Container>

{#if $surveySubPage == "entries"}
  <SurveyEntries {surveyIndex} />
{:else if $surveySubPage == "configs"}
  <SurveyConfigs {surveyIndex} />
{:else}
  <SurveyOptions {surveyIndex} />
{/if}
