<script lang="ts">
  import { createEntryFileName, download, entryAsCSV, shareAsFile, shareAsText, type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import QrCodeDisplay from "$lib/components/QRCodeDisplay.svelte";

  let {
    surveyRecord,
    entry,
  }: {
    surveyRecord: IDBRecord<Survey>;
    entry: IDBRecord<Entry>;
  } = $props();

  const exportFileName = createEntryFileName(surveyRecord, entry);

  let dialog: Dialog;
  let entryData = $state("");

  function onopen() {
    entryData = entryAsCSV(entry);
  }

  function shareEntryAsFile() {
    shareAsFile(entryData, exportFileName, "text/csv");
  }

  function shareEntryAsText() {
    shareAsText(entryData, exportFileName);
  }

  function downloadEntry() {
    download(entryData, exportFileName, "text/csv");
  }

  function onclose() {
    entryData = "";
  }
</script>

<Button onclick={() => dialog.open()}>
  <Container maxWidth>
    <Icon name="share-from-square" />
    Export
  </Container>
</Button>

<Dialog bind:this={dialog} {onopen} {onclose}>
  <span>Export entry</span>

  {#if entryData}
    <QrCodeDisplay data={entryData} />
  {/if}

  {#if "canShare" in navigator}
    <Button onclick={shareEntryAsFile}>
      <Container maxWidth>
        <Icon name="share-from-square" />
        Share as file
      </Container>
    </Button>
    <Button onclick={shareEntryAsText}>
      <Container maxWidth>
        <Icon name="share" />
        Share as text snippet
      </Container>
    </Button>
  {/if}
  <Button onclick={downloadEntry}>
    <Container maxWidth>
      <Icon name="download" />
      Download as file
    </Container>
  </Button>
</Dialog>
