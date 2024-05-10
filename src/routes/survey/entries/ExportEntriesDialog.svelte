<script lang="ts">
  import { download, shareAsFile, shareAsText } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { entryAsCSV, type Entry } from "$lib/entry";
  import { targetStore } from "$lib/settings";
  import type { Survey } from "$lib/survey";

  let {
    surveyRecord,
    entries,
  }: {
    surveyRecord: IDBRecord<Survey>;
    entries: IDBRecord<Entry>[];
  } = $props();

  let dialog: Dialog;

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

<Button onclick={() => dialog.open()}>
  <Container maxWidth>
    <Icon name="share-from-square" />
    Export entries
  </Container>
</Button>

<Dialog bind:this={dialog}>
  <span>Export entries</span>
  {#if "canShare" in navigator}
    <Button onclick={shareEntriesAsFile}>
      <Container maxWidth>
        <Icon name="share-from-square" />
        Share as file
      </Container>
    </Button>
    <Button onclick={shareEntriesAsText}>
      <Container maxWidth>
        <Icon name="share" />
        Share as text snippet
      </Container>
    </Button>
  {/if}
  <Button onclick={downloadEntries}>
    <Container maxWidth>
      <Icon name="download" />
      Download as file
    </Container>
  </Button>
</Dialog>
