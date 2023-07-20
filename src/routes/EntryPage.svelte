<script lang="ts">
  import { getMetricDefaultValue, surveys } from "$lib/app";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import MetricEditor from "$lib/components/MetricEditor.svelte";
  import { writable } from "svelte/store";

  export let surveyIndex: number;
  export let entryIndex: number;

  const survey = writable($surveys[surveyIndex]);
  survey.subscribe((survey) => {
    $surveys[surveyIndex] = survey;
  });

  let saveEntryDialog = { error: "" };

  function validateEntry() {
    let error = "";
    $survey.entries[entryIndex].forEach((value, i) => {
      switch ($survey.configs[i].type) {
        case "team":
          if (!/^\d{1,4}[A-Z]?$/.test(value)) {
            error = `Invalid value for ${$survey.configs[i].name}`;
          }
          if ($survey.teams.length && !$survey.teams.includes(value)) {
            error = `Invalid value for ${$survey.configs[i].name} (team not allowlisted)`;
          }
          break;
        case "match":
          if (!/\d{1,3}/.test(`${value}`)) {
            error = `Invalid value for ${$survey.configs[i].name}`;
          }
          break;
        case "text":
          if ($survey.configs[i].required && !value.trim()) {
            error = `Invalid value for ${$survey.configs[i].name}`;
          }
          break;
      }
      if (value == undefined || typeof value !== typeof getMetricDefaultValue($survey.configs[i])) {
        error = `Invalid value for ${$survey.configs[i].name}`;
      }
    });
    return error;
  }
</script>

<datalist id="teams-list">
  {#each $survey.teams as team}
    <option value={team} />
  {/each}
</datalist>

<Container padding alignEnd>
  {#each $survey.configs as config, i}
    <MetricEditor {config} bind:value={$survey.entries[entryIndex][i]} />
  {/each}
</Container>

<footer>
  <Dialog
    openButton={{ iconName: "floppy-disk", title: "Save entry" }}
    onConfirm={() => {
      let error = validateEntry();
      if (error) {
        saveEntryDialog.error = `Could not save entry! ${error}`;
        return false;
      }
      $survey.entries = [$survey.configs.map(getMetricDefaultValue), ...$survey.entries];
    }}
    on:close={() => (saveEntryDialog = { error: "" })}
  >
    <span>Save this entry and start a new one?</span>
    {#if saveEntryDialog.error}
      <span>{saveEntryDialog.error}</span>
    {/if}
  </Dialog>

  <Dialog
    openButton={{ iconName: "arrow-rotate-left", title: "Reset entry" }}
    onConfirm={() => {
      for (let i = 0; i < $survey.entries[entryIndex].length; i++) {
        if (!["team", "match"].includes($survey.configs[i].type)) {
          $survey.entries[entryIndex][i] = getMetricDefaultValue($survey.configs[i]);
        }
      }
    }}
  >
    <span>Reset this entry?</span>
  </Dialog>
</footer>
