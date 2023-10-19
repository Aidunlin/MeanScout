<script lang="ts">
  import type { Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import ConfigEditor from "$lib/components/ConfigEditor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import type { IDBRecord, SurveyStore } from "$lib/db";

  export let surveyStore: SurveyStore;
  export let surveyRecord: IDBRecord<Survey>;
  export let disabled: boolean;

  $: surveyStore.put(surveyRecord);

  let copySurveyDialog = { text: "" };

  function newConfig() {
    surveyRecord.configs = [...surveyRecord.configs, { name: "", type: "toggle" }];
  }

  function surveyToString() {
    const exportableSurvey = {
      name: surveyRecord.name,
      configs: surveyRecord.configs,
      teams: surveyRecord.teams,
      created: surveyRecord.created,
      modified: surveyRecord.modified,
    };
    return JSON.stringify(exportableSurvey, undefined, "  ");
  }
</script>

<Container column padding>
  <h2>Configs</h2>
  {#if disabled}
    <span>Cannot modify configs with entries present!</span>
  {/if}
  {#each surveyRecord.configs as config, configIndex (config)}
    <ConfigEditor bind:configs={surveyRecord.configs} bind:config {configIndex} {disabled} />
  {/each}
</Container>

<footer>
  <Button iconName="plus" title="New config" {disabled} on:click={newConfig} />

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
