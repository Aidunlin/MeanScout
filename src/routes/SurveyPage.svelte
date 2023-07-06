<script lang="ts">
  import { indexes, surveys } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import SurveyConfigs from "./SurveyConfigs.svelte";
  import SurveyEntries from "./SurveyEntries.svelte";
  import SurveyOptions from "./SurveyOptions.svelte";

  export let surveyIndex: number;

  let editing: "entries" | "configs" | "options" = "entries";
</script>

<Header title={$surveys[surveyIndex].name}>
  <Button iconName="arrow-left" title="Back to surveys" on:click={() => ($indexes.survey = undefined)} />
</Header>

<Container padding noGap>
  <Button
    iconName="list-ol"
    title="Entries"
    disableTheme={editing != "entries"}
    on:click={() => (editing = "entries")}
  />
  <Button iconName="gears" title="Configs" disableTheme={editing != "configs"} on:click={() => (editing = "configs")} />
  <Button
    iconName="ellipsis-vertical"
    title="Options"
    disableTheme={editing != "options"}
    on:click={() => (editing = "options")}
  />
</Container>

{#if editing == "entries"}
  <SurveyEntries {surveyIndex} />
{:else if editing == "configs"}
  <SurveyConfigs {surveyIndex} />
{:else}
  <SurveyOptions {surveyIndex} />
{/if}
