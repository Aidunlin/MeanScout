<script lang="ts">
  import { flattenFields, type Entry, type Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import FieldValueEditor from "$lib/components/FieldValueEditor.svelte";
  import Header from "$lib/components/Header.svelte";
  import DeleteDraftDialog from "$lib/dialogs/DeleteDraftDialog.svelte";
  import DeleteEntryDialog from "$lib/dialogs/DeleteEntryDialog.svelte";
  import EditEntryDialog from "$lib/dialogs/EditEntryDialog.svelte";
  import SubmitDraftDialog from "$lib/dialogs/SubmitDraftDialog.svelte";
  import { targetStore } from "$lib/target";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryRecord: IDBRecord<Entry>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);
  $: idb.transaction("entries", "readwrite").objectStore("entries").put(entryRecord);

  function countPreviousFields(index: number) {
    return flattenFields(surveyRecord.fields.slice(0, index)).length;
  }

  function getAllTeams() {
    const teamSet = new Set<string>();

    surveyRecord.matches.forEach((match) => {
      switch ($targetStore) {
        case "red 1":
          teamSet.add(match.red1);
          break;
        case "red 2":
          teamSet.add(match.red2);
          break;
        case "red 3":
          teamSet.add(match.red3);
          break;
        case "blue 1":
          teamSet.add(match.blue1);
          break;
        case "blue 2":
          teamSet.add(match.blue2);
          break;
        case "blue 3":
          teamSet.add(match.blue3);
          break;
        case "red":
          teamSet.add(match.red1);
          teamSet.add(match.red2);
          teamSet.add(match.red3);
          break;
        case "blue":
          teamSet.add(match.blue1);
          teamSet.add(match.blue2);
          teamSet.add(match.blue3);
          break;
        default:
          teamSet.add(match.red1);
          teamSet.add(match.red2);
          teamSet.add(match.red3);
          teamSet.add(match.blue1);
          teamSet.add(match.blue2);
          teamSet.add(match.blue3);
      }
    });

    surveyRecord.teams.forEach((team) => teamSet.add(team));

    return [...teamSet].toSorted((a, b) => parseInt(a) - parseInt(b));
  }
</script>

{#if entryRecord.status == "draft"}
  <Header backLink="survey/{surveyRecord.id}" title="Draft" iconName="pen-ruler" />

  <datalist id="teams-list">
    {#each getAllTeams() as team}
      <option value={team} />
    {/each}
  </datalist>

  <Container padding="large" align="end">
    {#each surveyRecord.fields as field, i (field)}
      {@const previousFields = countPreviousFields(i)}
      {#if field.type == "group"}
        <h2>{field.name}</h2>
        <Container align="end" maxWidth>
          {#each field.fields as innerField, innerFieldIndex (innerField)}
            <FieldValueEditor
              field={innerField}
              bind:value={entryRecord.values[previousFields + innerFieldIndex]}
              onChange={() => {
                entryRecord.modified = new Date();
                surveyRecord.modified = new Date();
              }}
            />
          {/each}
        </Container>
      {:else}
        <FieldValueEditor
          {field}
          bind:value={entryRecord.values[previousFields]}
          onChange={() => {
            entryRecord.modified = new Date();
            surveyRecord.modified = new Date();
          }}
        />
      {/if}
    {/each}
  </Container>

  <footer>
    <SubmitDraftDialog {idb} bind:surveyRecord draftRecord={entryRecord} />
    <DeleteDraftDialog {idb} bind:surveyRecord draftRecord={entryRecord} />
  </footer>
{:else}
  <Header backLink="survey/{surveyRecord.id}/entries" title="Entry" iconName="list-ol" />

  <Container direction="column" padding="large">
    {#each surveyRecord.fields as field, i (field)}
      {@const previousFields = countPreviousFields(i)}
      {#if field.type == "group"}
        <h2>{field.name}</h2>
        {#each field.fields as innerField, innerFieldIndex (innerField)}
          <span>{innerField.name}: {entryRecord.values[previousFields + innerFieldIndex]}</span>
        {/each}
      {:else}
        <span>{field.name}: {entryRecord.values[previousFields]}</span>
      {/if}
    {/each}
  </Container>

  <footer>
    <EditEntryDialog {idb} bind:surveyRecord {entryRecord} />
    <DeleteEntryDialog {idb} bind:surveyRecord {entryRecord} />
  </footer>
{/if}
