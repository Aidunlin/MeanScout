<script lang="ts">
  import { download, entryAsCSV, shareAsFile, shareAsText, type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { targetStore } from "$lib/settings";

  export let surveyRecord: IDBRecord<Survey>;
  export let entries: IDBRecord<Entry>[];

  const exportFileName = `${surveyRecord.name}-entries-${$targetStore}.csv`.replaceAll(" ", "_");

  function entriesAsCSV() {
    return entries.map(entryAsCSV).join("\n");
  }

  function shareEntriesAsFile() {
    shareAsFile(entriesAsCSV(), exportFileName, "text/csv");
  }

  function shareEntriesAsText() {
    shareAsText(entriesAsCSV(), exportFileName);
  }

  function downloadEntries() {
    download(entriesAsCSV(), exportFileName, "text/csv");
  }
</script>

<Dialog>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="share-from-square" />
      Export entries
    </Container>
  </Button>

  <span>Export entries</span>
  {#if "canShare" in navigator}
    <Button title="Share entries" on:click={shareEntriesAsFile}>
      <Container maxWidth>
        <Icon name="share-from-square" />
        Share as file
      </Container>
    </Button>
    <Button on:click={shareEntriesAsText}>
      <Container maxWidth>
        <Icon name="share" />
        Share as text snippet
      </Container>
    </Button>
  {/if}
  <Button title="Download entries" on:click={downloadEntries}>
    <Container maxWidth>
      <Icon name="download" />
      Download as file
    </Container>
  </Button>
</Dialog>
