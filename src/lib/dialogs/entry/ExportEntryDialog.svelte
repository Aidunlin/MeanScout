<script lang="ts">
  import { download, entryAsCSV, shareAsFile, shareAsText, type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import QrCodeDisplay from "$lib/components/QRCodeDisplay.svelte";

  export let surveyRecord: IDBRecord<Survey>;
  export let entry: IDBRecord<Entry>;

  const entryDetails = entry.type == "match" ? `-${entry.match}-${entry.absent}` : "";
  const exportFileName = `${surveyRecord.name}-entry-${entry.team}${entryDetails}.csv`.replaceAll(" ", "_");

  let entryData: string;

  function onOpen() {
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
</script>

<Dialog
  {onOpen}
  on:close={() => {
    entryData = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="share-from-square" />
      Export
    </Container>
  </Button>

  <span>Export entry</span>

  {#if entryData}
    <QrCodeDisplay data={entryData} />
  {/if}

  {#if "canShare" in navigator}
    <Button on:click={shareEntryAsFile}>
      <Container maxWidth>
        <Icon name="share-from-square" />
        Share as file
      </Container>
    </Button>
    <Button on:click={shareEntryAsText}>
      <Container maxWidth>
        <Icon name="share" />
        Share as text snippet
      </Container>
    </Button>
  {/if}
  <Button on:click={downloadEntry}>
    <Container maxWidth>
      <Icon name="download" />
      Download as file
    </Container>
  </Button>
</Dialog>
