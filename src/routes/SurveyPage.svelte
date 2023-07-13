<script lang="ts">
  import { downloadSurveyEntries, getMetricDefaultValue, routes, surveys, type Entry } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyIndex: number;

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
  <Button iconName="arrow-left" title="Back to surveys" on:click={() => ($routes = ["surveys"])} />
</Header>

<Container padding noGap>
  <Button iconName="list-ol" title="Entries" />
  <Button iconName="gears" title="Configs" disableTheme on:click={() => ($routes[1] = "configs")} />
  <Button iconName="ellipsis-vertical" title="Options" disableTheme on:click={() => ($routes[1] = "options")} />
</Container>

<Container column padding>
  <h2>Entries</h2>
  {#each $surveys[surveyIndex].entries as entry, entryIndex (entry)}
    <Container spaceBetween>
      <Container>
        <Button iconName="pen" title="Edit entry" on:click={() => ($routes[1] = entryIndex)} />
        <span>Team: {entry.team} | Match: {entry.match}</span>
      </Container>

      <Dialog
        openButton={{ iconName: "trash", title: "Delete entry" }}
        onConfirm={() => {
          $surveys[surveyIndex].entries = $surveys[surveyIndex].entries.filter((_, i) => i != entryIndex);
          return true;
        }}
      >
        <span>Delete this entry?</span>
        <span>
          Team: {$surveys[surveyIndex].entries[entryIndex].team}
          | Match: {$surveys[surveyIndex].entries[entryIndex].match}
        </span>
      </Dialog>
    </Container>
  {/each}
</Container>

<footer>
  <Button iconName="plus" title="New entry" on:click={newEntryClicked} />

  <Dialog
    openButton={{ iconName: "download", title: "Download entries" }}
    onConfirm={() => {
      downloadSurveyEntries($surveys[surveyIndex]);
      return true;
    }}
  >
    <span>Download entries as CSV?</span>
  </Dialog>
</footer>
