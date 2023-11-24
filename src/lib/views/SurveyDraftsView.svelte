<script lang="ts">
  import { flattenFields, getDefaultFieldValue, type Entry, type IDBRecord, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

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

  function newDraftClicked() {
    const fields = flattenFields(surveyRecord.fields);

    const allRecords = [...draftRecords, ...entryRecords];

    const draft: Entry = {
      surveyId: surveyRecord.id,
      values: fields.map((field, i) => {
        switch (field.type) {
          case "match":
            if (!allRecords.length) {
              return 1;
            }

            return Math.max(...allRecords.map((entry) => entry.values[i] ?? 0)) + 1;
          case "select":
            return field.values[0];
          default:
            return getDefaultFieldValue(field);
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
</script>

<Container column padding>
  <h2>Drafts</h2>
  {#each draftRecords as draft (draft.id)}
    <Container spaceBetween>
      <Container>
        <Anchor hash="draft/{draft.id}" title="Edit draft">
          <Icon name="arrow-right" />
        </Anchor>
        {#each flattenFields(surveyRecord.fields).slice(0, 2) as field, i}
          <span>{field.name}: {draft.values[i]}, </span>
        {/each}
        ...
      </Container>

      <Dialog
        onOpen={(element) => (deleteDraftDialog = { element, error: "" })}
        onConfirm={() => deleteDraft(draft.id)}
        on:close={() => (deleteDraftDialog = { error: "" })}
      >
        <Button title="Delete draft" slot="opener" let:open on:click={open}>
          <Icon name="trash" />
        </Button>

        <span>Delete this draft?</span>
        {#each flattenFields(surveyRecord.fields).slice(0, 2) as field, i}
          <span>{field.name}: {draft.values[i]}</span>
        {/each}
        {#if deleteDraftDialog.error}
          <span>{deleteDraftDialog.error}</span>
        {/if}
      </Dialog>
    </Container>
  {/each}
</Container>

<footer>
  <Button title="New draft" on:click={newDraftClicked}>
    <Icon name="plus" />
    Draft
  </Button>
</footer>
