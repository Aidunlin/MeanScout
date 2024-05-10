<script lang="ts">
  import { parseValueFromString } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Entry } from "$lib/entry";
  import type { Survey } from "$lib/survey";
  import QrCodeReader from "./QRCodeReader.svelte";

  let {
    idb,
    surveyRecord,
    exportedEntries = $bindable(),
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<Survey>;
    exportedEntries: IDBRecord<Entry>[];
  } = $props();

  let dialog: Dialog;
  let qrCodeReader: QrCodeReader;

  let qrCodeData = $state<string | undefined>(undefined);
  let error = "";

  function onopen() {
    qrCodeReader.start();
  }

  async function onconfirm() {
    if (!qrCodeData) {
      error = "No input";
      return;
    }

    const entryCSV = qrCodeData
      .trim()
      .split(",")
      .map((value) => value.trim());

    if (!entryCSV.length || !entryCSV[0].length) {
      error = "No input";
      return;
    }

    if (entryCSV[0] == "Team") {
      return;
    }

    let entry: Entry;
    if (surveyRecord.type == "match") {
      entry = {
        surveyId: surveyRecord.id,
        type: surveyRecord.type,
        status: "exported",
        team: entryCSV[0],
        match: parseInt(entryCSV[1]),
        absent: entryCSV[2].toLowerCase() == "true" ? true : false,
        values: entryCSV.slice(3).map(parseValueFromString),
        created: new Date(),
        modified: new Date(),
      };
    } else {
      entry = {
        surveyId: surveyRecord.id,
        type: surveyRecord.type,
        status: "exported",
        team: entryCSV[0],
        values: entryCSV.slice(1).map(parseValueFromString),
        created: new Date(),
        modified: new Date(),
      };
    }

    const addRequest = idb.transaction("entries", "readwrite").objectStore("entries").add(entry);
    addRequest.onsuccess = () => {
      const id = addRequest.result;
      if (!id) {
        error = "Could not add entry!";
        return;
      }

      exportedEntries = [{ ...entry, id: id as number }, ...exportedEntries];
      dialog.close();
    };

    addRequest.onerror = (e) => {
      e.preventDefault();
      error = "Could not add entry!";
    };
  }

  function onclose() {
    qrCodeReader.stop();
    qrCodeData = "";
    error = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Container maxWidth>
    <Icon name="qrcode" />
    Import from QR code
  </Container>
</Button>

<Dialog bind:this={dialog} {onconfirm} {onopen} {onclose}>
  <span>Import from QR code</span>
  <QrCodeReader
    bind:this={qrCodeReader}
    onRead={(data) => {
      qrCodeData = data;
    }}
  />
  {#if qrCodeData}
    <span>{qrCodeData}</span>
  {/if}
</Dialog>
