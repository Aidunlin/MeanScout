<script lang="ts">
  import {
    EntryStore,
    SurveyStore,
    flattenConfigs,
    getHighestMatchValue,
    target,
    type Entry,
    type IDBRecord,
    type Survey,
  } from "$lib/app";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyStore: SurveyStore;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryStore: EntryStore;
  export let entryRecords: IDBRecord<Entry>[];

  $: surveyStore.put(surveyRecord);

  function newEntryClicked() {
    const configs = flattenConfigs(surveyRecord.configs);
    const newValue = {
      team: "",
      match: getHighestMatchValue(entryRecords, configs) + 1,
      toggle: false,
      number: 0,
      text: "",
      rating: 0,
      timer: 0,
    };

    const entry: Entry = {
      surveyId: surveyRecord.id,
      values: configs.map((config) => {
        switch (config.type) {
          case "select":
            return config.values[0];
          default:
            return newValue[config.type];
        }
      }),
      created: new Date(),
      modified: new Date(),
    };

    entryStore.add(entry).then((id) => {
      entryRecords = [...entryRecords, { id, ...entry }];
    });
  }

  function valueToCSV(value: any) {
    return `${value}`.replaceAll(",", "").replaceAll("\n", ". ").trim();
  }

  function downloadEntries() {
    const csv = [
      flattenConfigs(surveyRecord.configs)
        .map((config) => config.name)
        .join(","),
      ...entryRecords.map((entry) => entry.values.map(valueToCSV).join(",")),
    ].join("\n");

    const anchor = document.createElement("a");
    anchor.download = `${surveyRecord.name}-${$target}.csv`.replaceAll(" ", "_");
    anchor.href = `data:text/plain;charset=utf-8,${encodeURIComponent(csv)}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function deleteEntry(id: number) {
    entryRecords = entryRecords.filter((entry) => entry.id !== id);
    entryStore.delete(id);
  }
</script>

<Header title={surveyRecord.name} backLink="surveys" />

<Container padding noGap>
  <Anchor hash="survey/{surveyRecord.id}/entries" iconName="list-ol" title="Entries" />
  <Anchor hash="survey/{surveyRecord.id}/configs" iconName="gears" title="Configs" disableTheme />
  <Anchor hash="survey/{surveyRecord.id}/options" iconName="ellipsis-vertical" title="Options" disableTheme />
</Container>

<Container column padding>
  <h2>Entries</h2>
  {#each entryRecords as entry (entry.id)}
    <Container spaceBetween>
      <Container>
        <Anchor hash="entry/{entry.id}" iconName="pen" title="Edit entry" />
        {#each flattenConfigs(surveyRecord.configs).slice(0, 2) as config, i}
          <span>{config.name}: {entry.values[i]}, </span>
        {/each}
        ...
      </Container>

      <Dialog openButton={{ iconName: "trash", title: "Delete entry" }} onConfirm={() => deleteEntry(entry.id)}>
        <span>Delete this entry?</span>
        {#each flattenConfigs(surveyRecord.configs).slice(0, 2) as config, i}
          <span>{config.name}: {entry.values[i]}</span>
        {/each}
      </Dialog>
    </Container>
  {/each}
</Container>

<footer>
  <Button iconName="plus" title="New entry" on:click={newEntryClicked} />
  <Button iconName="download" title="Download entries" on:click={downloadEntries} />
</footer>
