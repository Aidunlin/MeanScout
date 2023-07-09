<script lang="ts">
  import { getMetricDefaultValue, indexes, surveys, validateEntry, type Entry } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";
  import MetricEditor from "$lib/components/MetricEditor.svelte";

  export let surveyIndex: number;
  export let entryIndex: number;

  let dialogSaveEntry = { error: "", visible: false };
  let dialogResetEntry = { visible: false };

  function saveEntry() {
    let error = validateEntry($surveys[surveyIndex], $surveys[surveyIndex].entries[entryIndex]);

    if (error) {
      dialogSaveEntry.error = `Could not save entry! ${error}`;
      return;
    }

    let entry: Entry = {
      team: "",
      match: $surveys[surveyIndex].entries[entryIndex].match + 1,
      isAbsent: false,
      metrics: $surveys[surveyIndex].configs.map(getMetricDefaultValue),
    };
    $surveys[surveyIndex].entries = [entry, ...$surveys[surveyIndex].entries];

    dialogSaveEntry = { error: "", visible: false };
  }

  function resetSurvey() {
    $surveys[surveyIndex].entries[entryIndex].isAbsent = false;
    $surveys[surveyIndex].entries[entryIndex].metrics = $surveys[surveyIndex].configs.map(getMetricDefaultValue);

    dialogResetEntry = { visible: false };
  }
</script>

<Dialog title="Save this entry and start a new one?" bind:visible={dialogSaveEntry.visible}>
  {#if dialogSaveEntry.error}
    <span>{dialogSaveEntry.error}</span>
  {/if}
  <Button slot="buttons" iconName="check" title="Confirm" on:click={saveEntry} />
</Dialog>

<Dialog title="Reset this entry?" bind:visible={dialogResetEntry.visible}>
  <Button slot="buttons" iconName="check" title="Confirm" on:click={resetSurvey} />
</Dialog>

<Header title="Entry ({$surveys[surveyIndex].name})">
  <Button iconName="arrow-left" title="Back to survey" on:click={() => ($indexes.entry = undefined)} />
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
  <Button iconName="floppy-disk" title="Save entry" on:click={() => (dialogSaveEntry = { error: "", visible: true })} />
  <Button iconName="arrow-rotate-left" title="reset entry" on:click={() => (dialogResetEntry = { visible: true })} />
</footer>
