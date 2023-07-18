<script lang="ts">
  import { getMetricDefaultValue, surveys, type Entry, type Survey } from "$lib/app";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import MetricEditor from "$lib/components/MetricEditor.svelte";

  export let surveyIndex: number;
  export let entryIndex: number;

  let saveEntryDialog = { error: "" };

  function validateEntry(survey: Survey, entry: Entry) {
    let error = "";
    entry.forEach((value, i) => {
      switch (survey.configs[i].type) {
        case "team":
          if (!/^\d{1,4}[A-Z]?$/.test(value)) {
            error = `Invalid value for ${survey.configs[i].name}`;
          }
          if (survey.teams.length && !survey.teams.includes(value)) {
            error = `Invalid value for ${survey.configs[i].name} (team not allowlisted)`;
          }
          break;
        case "match":
          if (!/\d{1,3}/.test(`${value}`)) {
            error = `Invalid value for ${survey.configs[i].name}`;
          }
          break;
        case "text":
          if (survey.configs[i].required && !value.trim()) {
            error = `Invalid value for ${survey.configs[i].name}`;
          }
          break;
      }
      if (value == undefined || typeof value !== typeof getMetricDefaultValue(survey.configs[i])) {
        error = `Invalid value for ${survey.configs[i].name}`;
      }
    });
    return error;
  }
</script>

<datalist id="teams-list">
  {#each $surveys[surveyIndex].teams as team}
    <option value={team} />
  {/each}
</datalist>

<Container padding alignEnd>
  {#each $surveys[surveyIndex].configs as config, i}
    <MetricEditor {config} bind:value={$surveys[surveyIndex].entries[entryIndex][i]} />
  {/each}
</Container>

<footer>
  <Dialog
    openButton={{ iconName: "floppy-disk", title: "Save entry" }}
    onConfirm={() => {
      let error = validateEntry($surveys[surveyIndex], $surveys[surveyIndex].entries[entryIndex]);
      if (error) {
        saveEntryDialog.error = `Could not save entry! ${error}`;
        return false;
      }
      $surveys[surveyIndex].entries = [
        $surveys[surveyIndex].configs.map(getMetricDefaultValue),
        ...$surveys[surveyIndex].entries,
      ];
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
      for (let i = 0; i < $surveys[surveyIndex].entries[entryIndex].length; i++) {
        if (!["team", "match"].includes($surveys[surveyIndex].configs[i].type)) {
          $surveys[surveyIndex].entries[entryIndex][i] = getMetricDefaultValue($surveys[surveyIndex].configs[i]);
        }
      }
    }}
  >
    <span>Reset this entry?</span>
  </Dialog>
</footer>
