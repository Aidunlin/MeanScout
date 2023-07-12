<script lang="ts">
  import {
    downloadSurveyEntries,
    getMetricDefaultValue,
    indexes,
    surveyPage,
    surveys,
    type DialogData,
    type Entry,
    mainPage,
  } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyIndex: number;

  let downloadEntriesDialog: DialogData = {
    element: undefined,
    show() {
      this.element?.showModal();
    },
    confirm() {
      downloadSurveyEntries($surveys[surveyIndex]);
      this.close();
    },
    close() {
      this.element?.close();
    },
  };

  let deleteEntryDialog: DialogData & { entryIndex: number | undefined } = {
    element: undefined,
    entryIndex: undefined,
    show() {
      this.element?.showModal();
    },
    confirm() {
      $surveys[surveyIndex].entries = $surveys[surveyIndex].entries.filter((_, i) => i != this.entryIndex);
      this.close();
    },
    close() {
      this.entryIndex = undefined;
      this.element?.close();
    },
  };

  function newEntryClicked() {
    let match = 1;
    if ($surveys[surveyIndex].entries.length) {
      let matchValues = $surveys[surveyIndex].entries.map((entry) => entry.match);
      match = matchValues.reduce((prev, curr) => (curr > prev ? curr : prev)) + 1;
    }

    let entry: Entry = {
      team: "",
      match,
      isAbsent: false,
      metrics: $surveys[surveyIndex].configs.map(getMetricDefaultValue),
    };
    $surveys[surveyIndex].entries = [entry, ...$surveys[surveyIndex].entries];
  }
</script>

<Header title={$surveys[surveyIndex].name}>
  <Button
    iconName="arrow-left"
    title="Back to surveys"
    on:click={() => {
      $mainPage = "surveys";
      $indexes.survey = undefined;
    }}
  />
</Header>

<Container padding noGap>
  <Button iconName="list-ol" title="Entries" />
  <Button iconName="gears" title="Configs" disableTheme on:click={() => ($surveyPage = "configs")} />
  <Button iconName="ellipsis-vertical" title="Options" disableTheme on:click={() => ($surveyPage = "options")} />
</Container>

<Container column padding>
  <h2>Entries</h2>
  {#each $surveys[surveyIndex].entries as entry, entryIndex (entry)}
    <Container spaceBetween>
      <Container>
        <Button
          iconName="pen"
          title="Edit entry"
          on:click={() => {
            $mainPage = "surveys";
            $surveyPage = "entries";
            $indexes.entry = entryIndex;
          }}
        />
        <span>Team: {entry.team} | Match: {entry.match}</span>
      </Container>
      <Button
        iconName="trash"
        title="Delete entry"
        on:click={() => {
          deleteEntryDialog.entryIndex = entryIndex;
          deleteEntryDialog.show();
        }}
      />
    </Container>
  {/each}

  <dialog bind:this={deleteEntryDialog.element}>
    {#if deleteEntryDialog.entryIndex != undefined}
      <span>Delete this entry?</span>
      <span>
        Team: {$surveys[surveyIndex].entries[deleteEntryDialog.entryIndex].team}
        | Match: {$surveys[surveyIndex].entries[deleteEntryDialog.entryIndex].match}
      </span>
      <Container spaceBetween>
        <Button iconName="check" title="Confirm" on:click={() => deleteEntryDialog.confirm()} />
        <Button iconName="xmark" title="Close" on:click={() => deleteEntryDialog.close()} />
      </Container>
    {/if}
  </dialog>
</Container>

<footer>
  <Button iconName="plus" title="New entry" on:click={newEntryClicked} />

  <Button iconName="download" title="Download entries" on:click={() => downloadEntriesDialog.show()} />
  <dialog bind:this={downloadEntriesDialog.element}>
    <span>Download entries as CSV?</span>
    <Container spaceBetween>
      <Button iconName="check" title="Confirm" on:click={() => downloadEntriesDialog.confirm()} />
      <Button iconName="xmark" title="Close" on:click={() => downloadEntriesDialog.close()} />
    </Container>
  </dialog>
</footer>
