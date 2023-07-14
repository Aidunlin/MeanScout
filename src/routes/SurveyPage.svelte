<script lang="ts">
  import { downloadSurveyEntries, getMetricDefaultValue, surveys, type Entry } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";

  export let surveyIndex: number;

  function newEntryClicked() {
    let entry: Entry = $surveys[surveyIndex].configs.map(getMetricDefaultValue);
    $surveys[surveyIndex].entries = [entry, ...$surveys[surveyIndex].entries];
  }
</script>

<Container padding noGap>
  <Button iconName="list-ol" title="Entries" />
  <Button
    iconName="gears"
    title="Configs"
    disableTheme
    on:click={() => (window.location.hash = `${surveyIndex}/configs`)}
  />
  <Button
    iconName="ellipsis-vertical"
    title="Options"
    disableTheme
    on:click={() => (window.location.hash = `${surveyIndex}/options`)}
  />
</Container>

<Container column padding>
  <h2>Entries</h2>
  {#each $surveys[surveyIndex].entries as entry, entryIndex (entry)}
    <Container spaceBetween>
      <Container>
        <Button
          iconName="pen"
          title="Edit entry"
          on:click={() => (window.location.hash = `${surveyIndex}/${entryIndex}`)}
        />
        {#each $surveys[surveyIndex].configs.slice(0, 2) as config, i}
          <span>{config.name}: {entry[i]}, </span>
        {/each}
        ...
      </Container>

      <Dialog
        openButton={{ iconName: "trash", title: "Delete entry" }}
        onConfirm={() => {
          $surveys[surveyIndex].entries = $surveys[surveyIndex].entries.filter((_, i) => i != entryIndex);
          return true;
        }}
      >
        <span>Delete this entry?</span>
        {#each $surveys[surveyIndex].configs.slice(0, 2) as config, i}
          <span>{config.name}: {entry[i]}</span>
        {/each}
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
