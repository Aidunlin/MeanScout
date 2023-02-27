<script lang="ts">
  import type { Entry } from "$lib/app";
  import { downloadSurveyEntries, getMetricDefaultValue, indexes, surveys } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyIndex: number;

  let dialogCopySurvey = { text: "", visible: false };
  let dialogDownloadEntries = { visible: false };
  let dialogDeleteEntry = { entryIndex: 0, visible: false };

  function setCopyText(text: string) {
    dialogCopySurvey.text = text;
  }

  $: setCopyText(JSON.stringify($surveys[surveyIndex], undefined, "  "));

  function downloadEntries() {
    downloadSurveyEntries($surveys[surveyIndex]);

    dialogDownloadEntries = { visible: false };
  }

  function deleteEntry() {
    $surveys[surveyIndex].entries = $surveys[surveyIndex].entries.filter((_, i) => i != dialogDeleteEntry.entryIndex);

    dialogDeleteEntry = { entryIndex: 0, visible: false };
  }

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

<Dialog title="Select and copy the survey:" bind:visible={dialogCopySurvey.visible}>
  <Container maxWidth>
    <textarea readonly bind:value={dialogCopySurvey.text} />
  </Container>
</Dialog>

<Dialog title="Download entries as CSV?" bind:visible={dialogDownloadEntries.visible}>
  <Button slot="buttons" iconName="check" title="Confirm" on:click={downloadEntries} />
</Dialog>

<Dialog title="Delete this entry?" bind:visible={dialogDeleteEntry.visible}>
  <span>
    Team: {$surveys[surveyIndex].entries[dialogDeleteEntry.entryIndex].team}
    | Match: {$surveys[surveyIndex].entries[dialogDeleteEntry.entryIndex].match}
  </span>
  <Button slot="buttons" iconName="check" title="Confirm" on:click={deleteEntry} />
</Dialog>

<Header title={$surveys[surveyIndex].name}>
  <Button iconName="arrow-left" title="Back to surveys" on:click={() => ($indexes.survey = undefined)} />
</Header>

<Container column padding>
  <h2>Entries</h2>
  {#each $surveys[surveyIndex].entries as entry, entryIndex (entry)}
    <Container spaceBetween>
      <Container>
        <Button iconName="pen" title="Edit entry" on:click={() => ($indexes.entry = entryIndex)} />
        <span>Team: {entry.team} | Match: {entry.match}</span>
      </Container>
      <Button
        iconName="trash"
        title="Delete entry"
        on:click={() => (dialogDeleteEntry = { entryIndex, visible: true })}
      />
    </Container>
  {/each}
</Container>

<footer>
  <Button iconName="plus" title="New entry" on:click={newEntryClicked} />
  <Container>
    <Button iconName="copy" title="Copy survey" on:click={() => (dialogCopySurvey.visible = true)} />
    <Button iconName="download" title="Download entries" on:click={() => (dialogDownloadEntries.visible = true)} />
  </Container>
</footer>
