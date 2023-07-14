<script lang="ts">
  import { getMetricDefaultValue, surveys, validateEntry } from "$lib/app";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import MetricEditor from "$lib/components/MetricEditor.svelte";

  export let surveyIndex: number;
  export let entryIndex: number;

  let saveEntryDialog = { error: "" };
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
      return true;
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
      return true;
    }}
  >
    <span>Reset this entry?</span>
  </Dialog>
</footer>
