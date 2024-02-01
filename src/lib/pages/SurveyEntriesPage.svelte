<script lang="ts">
  import { download, flattenFields, share, type Entry, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { targetStore } from "$lib/target";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let entryRecords: IDBRecord<Entry>[] = [];

  const entryCursorRequest = idb
    .transaction("entries")
    .objectStore("entries")
    .index("surveyId")
    .openCursor(surveyRecord.id);
  entryCursorRequest.onsuccess = () => {
    const cursor = entryCursorRequest.result;
    if (cursor) {
      if (cursor.value.status != "draft") {
        entryRecords = [...entryRecords, cursor.value];
      }
      cursor.continue();
    }
  };

  const importantFields = flattenFields(surveyRecord.fields).filter(
    (field) => field.type == "team" || field.type == "match",
  );

  function valueAsCSV(value: any) {
    return value.toString().replaceAll(",", "").replaceAll("\n", ". ").trim();
  }

  function entriesAsCSV() {
    return entryRecords.map((entry) => entry.values.map(valueAsCSV).join(",")).join("\n");
  }

  function downloadEntries() {
    download(entriesAsCSV(), `${surveyRecord.name}-entries-${$targetStore}.csv`, "text/csv");
  }

  function shareEntries() {
    share(entriesAsCSV(), `${surveyRecord.name}-entries-${$targetStore}.csv`, "text/csv");
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Entries" iconName="list-ol" />

<Container direction="column" padding="large">
  {#if entryRecords.length}
    <Button title="Download entries" on:click={downloadEntries}>
      <Container maxWidth>
        <Icon name="download" />
        Download entries
      </Container>
    </Button>
    {#if "canShare" in navigator}
      <Button title="Share entries" on:click={shareEntries}>
        <Container maxWidth>
          <Icon name="share-from-square" />
          Share entries
        </Container>
      </Button>
    {/if}

    <h2>Entries</h2>
    {#each entryRecords.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as entry (entry.id)}
      <Anchor hash="entry/{entry.id}" title="Edit entry">
        <Container align="center" maxWidth spaceBetween>
          <Container direction="column" gap="small">
            {#each importantFields as field, i}
              <span>{field.name}: {entry.values[i]}</span>
            {/each}
          </Container>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/each}
  {:else}
    No entries.
  {/if}
</Container>
