<script lang="ts">
  import { flattenConfigs, getHighestMatchValue, type Entry, type Survey, type IDBRecord } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import { targetStore } from "$lib/target";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  let entryRecords: IDBRecord<Entry>[] = [];

  const cursorRequest = idb.transaction("entries").objectStore("entries").index("surveyId").openCursor(surveyRecord.id);
  cursorRequest.onsuccess = () => {
    const cursor = cursorRequest.result;
    if (cursor) {
      entryRecords = [...entryRecords, cursor.value];
      cursor.continue();
    }
  };

  let deleteEntryDialog: { element?: HTMLDialogElement; error: string } = { error: "" };

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

    const addRequest = idb.transaction("entries", "readwrite").objectStore("entries").add(entry);
    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) return;

      entryRecords = [...entryRecords, { id, ...entry }];
    };
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
    anchor.download = `${surveyRecord.name}-${$targetStore}.csv`.replaceAll(" ", "_");
    anchor.href = `data:text/plain;charset=utf-8,${encodeURIComponent(csv)}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function deleteEntry(id: number) {
    const deleteRequest = idb.transaction("entries", "readwrite").objectStore("entries").delete(id);
    deleteRequest.onerror = () => {
      deleteEntryDialog.error = `Could not delete entry: ${deleteRequest.error?.message}`;
    };

    deleteRequest.onsuccess = () => {
      entryRecords = entryRecords.filter((entry) => entry.id !== id);
      deleteEntryDialog.element?.close();
    };
  }
</script>

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

      <Dialog
        openButton={{ iconName: "trash", title: "Delete entry" }}
        onOpen={(element) => (deleteEntryDialog = { element, error: "" })}
        onConfirm={() => deleteEntry(entry.id)}
        on:close={() => (deleteEntryDialog = { error: "" })}
      >
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
