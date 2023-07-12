<script lang="ts">
  import {
    getMetricDefaultValue,
    indexes,
    surveys,
    validateEntry,
    type DialogData,
    type Entry,
    mainPage,
    surveyPage,
  } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import MetricEditor from "$lib/components/MetricEditor.svelte";

  export let surveyIndex: number;
  export let entryIndex: number;

  let saveEntryDialog: DialogData & { error: string } = {
    element: undefined,
    error: "",
    show() {
      this.error = "";
      this.element?.showModal();
    },
    confirm() {
      let error = validateEntry($surveys[surveyIndex], $surveys[surveyIndex].entries[entryIndex]);
      if (error) {
        this.error = `Could not save entry! ${error}`;
        return;
      }
      let entry: Entry = {
        team: "",
        match: $surveys[surveyIndex].entries[entryIndex].match + 1,
        isAbsent: false,
        metrics: $surveys[surveyIndex].configs.map(getMetricDefaultValue),
      };
      $surveys[surveyIndex].entries = [entry, ...$surveys[surveyIndex].entries];
      this.close();
    },
    close() {
      this.error = "";
      this.element?.close();
    },
  };

  let resetEntryDialog: DialogData = {
    element: undefined,
    show() {
      this.element?.showModal();
    },
    confirm() {
      $surveys[surveyIndex].entries[entryIndex].isAbsent = false;
      $surveys[surveyIndex].entries[entryIndex].metrics = $surveys[surveyIndex].configs.map(getMetricDefaultValue);
      this.close();
    },
    close() {
      this.element?.close();
    },
  };
</script>

<dialog bind:this={saveEntryDialog.element}>
  <span>Save this entry and start a new one?</span>
  {#if saveEntryDialog.error}
    <span>{saveEntryDialog.error}</span>
  {/if}
  <Container spaceBetween>
    <Button iconName="check" title="Confirm" on:click={() => saveEntryDialog.confirm()} />
    <Button iconName="xmark" title="Close" on:click={() => saveEntryDialog.close()} />
  </Container>
</dialog>

<dialog bind:this={resetEntryDialog.element}>
  <span>Reset this entry?</span>
  <Container spaceBetween>
    <Button iconName="check" title="Confirm" on:click={() => resetEntryDialog.confirm()} />
    <Button iconName="xmark" title="Close" on:click={() => resetEntryDialog.close()} />
  </Container>
</dialog>

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
  <Button iconName="floppy-disk" title="Save entry" on:click={() => saveEntryDialog.show()} />
  <Button iconName="arrow-rotate-left" title="Reset entry" on:click={() => resetEntryDialog.show()} />
</footer>
