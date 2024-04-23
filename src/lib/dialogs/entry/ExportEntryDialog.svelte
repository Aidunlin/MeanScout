<script lang="ts">
  import { download, shareAsFile, shareAsText, type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import QRCode from "qrcode";

  export let surveyRecord: IDBRecord<Survey>;
  export let entry: IDBRecord<Entry>;

  let qrCodeCanvas: HTMLCanvasElement;

  const entryDetails = entry.type == "match" ? `-${entry.match}-${entry.absent}` : "";
  const exportFileName = `${surveyRecord.name}-entry-${entry.team}${entryDetails}.csv`.replaceAll(" ", "_");

  function valueAsCSV(value: any) {
    return value.toString().replaceAll(",", "").replaceAll("\n", ". ").trim();
  }

  function entryAsCSV() {
    const mainValues = [valueAsCSV(entry.team)];
    if (entry.type == "match") {
      mainValues.push(valueAsCSV(entry.match), valueAsCSV(entry.absent));
    }
    return [...mainValues, ...entry.values.map(valueAsCSV)].join(",");
  }

  function createQRCode() {
    QRCode.toCanvas(qrCodeCanvas, entryAsCSV(), { width: 1000, margin: 1 });
  }

  function shareEntryAsFile() {
    shareAsFile(entryAsCSV(), exportFileName, "text/csv");
  }

  function shareEntryAsText() {
    shareAsText(entryAsCSV(), exportFileName);
  }

  function downloadEntry() {
    download(entryAsCSV(), exportFileName, "text/csv");
  }
</script>

<Dialog onOpen={createQRCode}>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="share-from-square" />
      Export
    </Container>
  </Button>

  <span>Export entry</span>
  <canvas bind:this={qrCodeCanvas} style="aspect-ratio:1/1;max-width:100%;flex-basis:0;"></canvas>
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
