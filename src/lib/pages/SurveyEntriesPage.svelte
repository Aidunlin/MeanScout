<script lang="ts">
  import { flattenFields, type Entry, type IDBRecord, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";

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
      entryRecords = [...entryRecords, cursor.value];
      cursor.continue();
    }
  };

  const importantFields = flattenFields(surveyRecord.fields).filter(
    (field) => field.type == "team" || field.type == "match",
  );
</script>

<Header
  parent={{ text: surveyRecord.name, iconName: "list-ul", hash: `survey/${surveyRecord.id}` }}
  current={{ text: "Entries", iconName: "list-ol" }}
/>

{#if entryRecords.length}
  <Container direction="column" padding="large">
    {#each entryRecords as entry (entry.id)}
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
  </Container>
{/if}
