<script lang="ts">
  import { entryAsCSV, type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import QrCodeDisplay from "$lib/components/QRCodeDisplay.svelte";
  import { flattenFields, getDefaultFieldValue } from "$lib/field";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let draftRecord: IDBRecord<Entry>;

  const flattenedFields = flattenFields(surveyRecord.fields);

  let entryData: string;
  let error = "";

  function onOpen() {
    for (let i = 0; i < draftRecord.values.length; i++) {
      const value = draftRecord.values[i];
      if (value == undefined || typeof value !== typeof getDefaultFieldValue(flattenedFields[i])) {
        error = `Invalid value for ${flattenedFields[i].name}`;
        return;
      }
    }

    entryData = entryAsCSV(draftRecord);
  }

  function onConfirm() {
    if (error) {
      return;
    }

    let entryRecord: Entry = { ...draftRecord, status: "submitted", modified: new Date() };

    const submitRequest = idb.transaction("entries", "readwrite").objectStore("entries").put(entryRecord);
    submitRequest.onerror = () => {
      error = `Could not submit draft: ${submitRequest.error?.message}`;
    };

    submitRequest.onsuccess = () => {
      surveyRecord.modified = new Date();
      location.hash = `/survey/${surveyRecord.id}`;
    };
  }
</script>

<Dialog
  {onOpen}
  {onConfirm}
  on:close={() => {
    entryData = "";
    error = "";
  }}
>
  <Button title="Submit draft" slot="opener" let:open on:click={open}>
    <Icon name="floppy-disk" />
    Submit
  </Button>

  <span>Share this draft:</span>

  {#if entryData}
    <QrCodeDisplay data={entryData} />
  {/if}

  <span>Submit draft?</span>
  {#if error}
    <span>{error}</span>
  {/if}
</Dialog>
