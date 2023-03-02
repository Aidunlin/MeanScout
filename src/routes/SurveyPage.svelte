<script lang="ts">
  import { indexes, surveys } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import SurveyConfigs from "./SurveyConfigs.svelte";
  import SurveyEntries from "./SurveyEntries.svelte";

  export let surveyIndex: number;

  let editing: "entries" | "configs" = "entries";
</script>

<Header title={$surveys[surveyIndex].name}>
  <Button iconName="arrow-left" title="Back to surveys" on:click={() => ($indexes.survey = undefined)} />
</Header>

<Container padding>
  <Button
    iconName="pen"
    title="Edit {editing == 'entries' ? 'Configs' : 'Entries'}"
    text={editing == "entries" ? "Configs" : "Entries"}
    on:click={() => (editing = editing == "entries" ? "configs" : "entries")}
  />
</Container>

{#if editing == "entries"}
  <SurveyEntries {surveyIndex} />
{:else}
  <SurveyConfigs {surveyIndex} />
{/if}
