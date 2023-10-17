<script lang="ts">
  import type { Survey, SurveyStore } from "$lib/app";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import ConfigEditor from "$lib/components/ConfigEditor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyStore: SurveyStore;
  export let survey: Survey;

  $: surveyStore.put(survey);

  let copySurveyDialog = { text: "" };

  function newConfig() {
    survey.configs = [...survey.configs, { name: "", type: "toggle" }];
  }

  function surveyToString() {
    const exportableSurvey = {
      name: survey.name,
      configs: survey.configs,
      teams: survey.teams,
      created: survey.created,
      modified: survey.modified,
    };
    return JSON.stringify(exportableSurvey, undefined, "  ");
  }
</script>

<Header title={survey.name} backLink="surveys" />

<Container padding noGap>
  <Anchor hash="survey/{survey.id}/entries" iconName="list-ol" title="Entries" disableTheme />
  <Anchor hash="survey/{survey.id}/configs" iconName="gears" title="Configs" />
  <Anchor hash="survey/{survey.id}/options" iconName="ellipsis-vertical" title="Options" disableTheme />
</Container>

<Container column padding>
  <h2>Configs</h2>
  {#if survey.entries.length}
    <span>Cannot modify configs with entries present!</span>
  {/if}
  {#each survey.configs as config, configIndex (config)}
    <ConfigEditor bind:configs={survey.configs} bind:config {configIndex} disabled={survey.entries.length != 0} />
  {/each}
</Container>

<footer>
  <Button iconName="plus" title="New config" disabled={survey.entries.length != 0} on:click={newConfig} />

  <Dialog
    openButton={{ iconName: "copy", title: "Copy survey" }}
    onOpen={() => (copySurveyDialog = { text: surveyToString() })}
  >
    <span>Select and copy the survey:</span>
    <Container maxWidth>
      <textarea readonly bind:value={copySurveyDialog.text} />
    </Container>
  </Dialog>
</footer>
