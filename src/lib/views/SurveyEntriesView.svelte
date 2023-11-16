<script lang="ts">
  import { flattenConfigs, type Entry, type IDBRecord, type Survey, getMetricDefaultValue } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import { targetStore } from "$lib/target";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  let draftRecords: IDBRecord<Entry>[] = [];
  let entryRecords: IDBRecord<Entry>[] = [];

  const cursorTransaction = idb.transaction(["drafts", "entries"]);

  const draftCursorRequest = cursorTransaction.objectStore("drafts").index("surveyId").openCursor(surveyRecord.id);
  draftCursorRequest.onsuccess = () => {
    const cursor = draftCursorRequest.result;
    if (cursor) {
      draftRecords = [...draftRecords, cursor.value];
      cursor.continue();
    }
  };

  const entryCursorRequest = cursorTransaction.objectStore("entries").index("surveyId").openCursor(surveyRecord.id);
  entryCursorRequest.onsuccess = () => {
    const cursor = entryCursorRequest.result;
    if (cursor) {
      entryRecords = [...entryRecords, cursor.value];
      cursor.continue();
    }
  };

  let deleteDraftDialog: { element?: HTMLDialogElement; error: string } = { error: "" };
  let deleteEntryDialog: { element?: HTMLDialogElement; error: string } = { error: "" };

  function newDraftClicked() {
    const configs = flattenConfigs(surveyRecord.configs);

    const allRecords = [...draftRecords, ...entryRecords];

    const draft: Entry = {
      surveyId: surveyRecord.id,
      values: configs.map((config, i) => {
        switch (config.type) {
          case "match":
            if (!allRecords.length) {
              return 1;
            }

            return Math.max(...allRecords.map((entry) => entry.values[i] ?? 0)) + 1;
          case "select":
            return config.values[0];
          default:
            return getMetricDefaultValue(config);
        }
      }),
      created: new Date(),
      modified: new Date(),
    };

    const addRequest = idb.transaction("drafts", "readwrite").objectStore("drafts").add(draft);
    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) return;

      location.hash = `/draft/${id}`;
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

  function deleteDraft(id: number) {
    const deleteRequest = idb.transaction("drafts", "readwrite").objectStore("drafts").delete(id);
    deleteRequest.onerror = () => {
      deleteDraftDialog.error = `Could not delete draft: ${deleteRequest.error?.message}`;
    };

    deleteRequest.onsuccess = () => {
      draftRecords = draftRecords.filter((draft) => draft.id !== id);
      deleteDraftDialog.element?.close();
    };
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
  <h2>Drafts</h2>
  {#each draftRecords as draft (draft.id)}
    <Container spaceBetween>
      <Container>
        <Anchor hash="draft/{draft.id}" iconName="arrow-right" title="Edit draft" />
        {#each flattenConfigs(surveyRecord.configs).slice(0, 2) as config, i}
          <span>{config.name}: {draft.values[i]}, </span>
        {/each}
        ...
      </Container>

      <Dialog
        openButton={{ iconName: "trash", title: "Delete draft" }}
        onOpen={(element) => (deleteDraftDialog = { element, error: "" })}
        onConfirm={() => deleteDraft(draft.id)}
        on:close={() => (deleteDraftDialog = { error: "" })}
      >
        <span>Delete this draft?</span>
        {#each flattenConfigs(surveyRecord.configs).slice(0, 2) as config, i}
          <span>{config.name}: {draft.values[i]}</span>
        {/each}
        {#if deleteDraftDialog.error}
          <span>{deleteDraftDialog.error}</span>
        {/if}
      </Dialog>
    </Container>
  {/each}
</Container>

<Container column padding>
  <h2>Entries</h2>
  {#each entryRecords as entry (entry.id)}
    <Container spaceBetween>
      <Container>
        <Anchor hash="entry/{entry.id}" iconName="arrow-right" title="View entry" />
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
        {#if deleteEntryDialog.error}
          <span>{deleteEntryDialog.error}</span>
        {/if}
      </Dialog>
    </Container>
  {/each}
</Container>

<footer>
  <Button iconName="plus" text="Draft" title="New draft" on:click={newDraftClicked} />
  <Button iconName="download" text="Download" title="Download entries" on:click={downloadEntries} />
</footer>
