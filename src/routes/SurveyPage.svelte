<script lang="ts">
  import { surveys, target, type Entry } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";

  export let surveyIndex: number;

  function getHighestMatchValue() {
    let highest = 0;

    $surveys[surveyIndex].entries.forEach((entry) => {
      entry.forEach((value, i) => {
        if ($surveys[surveyIndex].configs[i].type == "match") {
          highest = Math.max(value, highest);
        }
      });
    });

    return highest;
  }

  function newEntryClicked() {
    const newValue = {
      team: "",
      match: getHighestMatchValue() + 1,
      toggle: false,
      number: 0,
      text: "",
      rating: 0,
      timer: 0,
    };

    const entry: Entry = $surveys[surveyIndex].configs.map((config) => {
      return config.type == "select" ? config.values[0] : newValue[config.type];
    });

    $surveys[surveyIndex].entries = [entry, ...$surveys[surveyIndex].entries];
  }

  function valueToCSV(value: any) {
    return `${value}`.replaceAll(",", "").replaceAll("\n", ". ").trim();
  }

  function entryToCSV(entry: Entry) {
    return entry.map(valueToCSV).join(",");
  }

  function downloadEntries() {
    const csv = [
      $surveys[surveyIndex].configs.map((config) => config.name).join(","),
      ...$surveys[surveyIndex].entries.map(entryToCSV),
    ].join("\n");

    const anchor = document.createElement("a");
    anchor.download = `${$surveys[surveyIndex].name}-${$target}.csv`.replaceAll(" ", "_");
    anchor.href = `data:text/plain;charset=utf-8,${encodeURIComponent(csv)}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
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
  <Button iconName="download" title="Download entries" on:click={downloadEntries} />
</footer>
