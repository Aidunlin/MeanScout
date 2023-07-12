<script lang="ts">
  import { getMetricDefaultValue, indexes, mainPage, surveyPage, surveys, validateEntry } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";
  import MetricEditor from "$lib/components/MetricEditor.svelte";

  export let surveyIndex: number;
  export let entryIndex: number;

  let saveEntryDialog = { error: "" };
</script>

<Header title="Entry ({$surveys[surveyIndex].name})">
  <Button
    iconName="arrow-left"
    title="Back to survey"
    on:click={() => {
      $mainPage = "surveys";
      $surveyPage = "entries";
      $indexes.entry = undefined;
    }}
  />
</Header>

<Container padding alignEnd>
  <Container column noGap>
    Team
    <input
      id="metric-team"
      list="teams-list"
      maxlength="5"
      bind:value={$surveys[surveyIndex].entries[entryIndex].team}
    />
    <datalist id="teams-list">
      {#each $surveys[surveyIndex].teams as team}
        <option value={team} />
      {/each}
    </datalist>
  </Container>
  <Container column noGap>
    Match
    <input
      id="metric-match"
      type="number"
      pattern="[0-9]*"
      bind:value={$surveys[surveyIndex].entries[entryIndex].match}
    />
  </Container>
  <MetricEditor
    config={{ name: "Absent", type: "toggle" }}
    bind:value={$surveys[surveyIndex].entries[entryIndex].isAbsent}
  />
</Container>

{#if !$surveys[surveyIndex].entries[entryIndex].isAbsent}
  <Container padding alignEnd>
    {#each $surveys[surveyIndex].configs as config, i}
      <MetricEditor {config} bind:value={$surveys[surveyIndex].entries[entryIndex].metrics[i]} />
    {/each}
  </Container>
{/if}

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
        {
          team: "",
          match: $surveys[surveyIndex].entries[entryIndex].match + 1,
          isAbsent: false,
          metrics: $surveys[surveyIndex].configs.map(getMetricDefaultValue),
        },
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
      $surveys[surveyIndex].entries[entryIndex].isAbsent = false;
      $surveys[surveyIndex].entries[entryIndex].metrics = $surveys[surveyIndex].configs.map(getMetricDefaultValue);
      return true;
    }}
  >
    <span>Reset this entry?</span>
  </Dialog>
</footer>
