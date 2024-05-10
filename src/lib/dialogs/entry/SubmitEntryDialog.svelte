<script lang="ts">
  import { entryAsCSV, type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import QrCodeDisplay from "$lib/components/QRCodeDisplay.svelte";
  import { flattenFields, getDefaultFieldValue } from "$lib/field";

  let {
    idb,
    surveyRecord = $bindable(),
    entryRecord: entryRecord,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<Survey>;
    entryRecord: IDBRecord<Entry>;
  } = $props();

  const flattenedFields = flattenFields(surveyRecord.fields);

  let dialog: Dialog;

  let entryData = $state("");
  let error = $state("");

  function onopen() {
    for (let i = 0; i < entryRecord.values.length; i++) {
      const value = entryRecord.values[i];
      if (value == undefined || typeof value !== typeof getDefaultFieldValue(flattenedFields[i])) {
        error = `Invalid value for ${flattenedFields[i].name}`;
        return;
      }
    }

    entryData = entryAsCSV(entryRecord);
  }

  function onconfirm() {
    if (error) {
      return;
    }

    let submittedEntry: Entry = {
      ...$state.snapshot(entryRecord),
      status: "submitted",
      modified: new Date(),
    };

    const submitRequest = idb.transaction("entries", "readwrite").objectStore("entries").put(submittedEntry);
    submitRequest.onerror = () => {
      error = `Could not submit entry: ${submitRequest.error?.message}`;
    };

    submitRequest.onsuccess = () => {
      surveyRecord.modified = new Date();
      location.hash = `/survey/${surveyRecord.id}`;
    };
  }

  function onclose() {
    entryData = "";
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Icon name="floppy-disk" />
  Submit
</Button>

<Dialog bind:this={dialog} {onopen} {onconfirm} {onclose}>
  <span>Share this entry:</span>

  {#if entryData}
    <QrCodeDisplay data={entryData} />
  {/if}

  <span>Submit entry?</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
