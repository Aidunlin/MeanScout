<script lang="ts">
  import { type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import FieldValueEditor from "$lib/components/FieldValueEditor.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import DeleteDraftDialog from "$lib/dialogs/DeleteDraftDialog.svelte";
  import DeleteEntryDialog from "$lib/dialogs/DeleteEntryDialog.svelte";
  import EditEntryDialog from "$lib/dialogs/EditEntryDialog.svelte";
  import SubmitDraftDialog from "$lib/dialogs/SubmitDraftDialog.svelte";
  import { flattenFields } from "$lib/field";
  import { targetStore } from "$lib/settings";

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

    if (surveyRecord.type == "match") {
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
          default:
            teamSet.add(match.red1);
            teamSet.add(match.red2);
            teamSet.add(match.red3);
            teamSet.add(match.blue1);
            teamSet.add(match.blue2);
            teamSet.add(match.blue3);
        }
      });
    }

    surveyRecord.teams.forEach((team) => teamSet.add(team));

    return [...teamSet].toSorted((a, b) => parseInt(a) - parseInt(b));
  }

  function onChange() {
    entryRecord.modified = new Date();
    surveyRecord.modified = new Date();
  }
</script>

{#if entryRecord.status == "draft"}
  <Header backLink="survey/{surveyRecord.id}" title="Draft" iconName="pen-ruler" />

  <Container padding="large" align="end">
    <Container direction="column" gap="none">
      Team
      <datalist id="teams-list">
        {#each getAllTeams() as team}
          <option value={team} />
        {/each}
      </datalist>
      <input class="team" list="teams-list" maxlength="6" bind:value={entryRecord.team} on:change={onChange} required />
    </Container>
    {#if entryRecord.type == "match"}
      <Container direction="column" gap="none">
        Match
        <input
          class="match"
          type="number"
          pattern="[0-9]*"
          bind:value={entryRecord.match}
          on:change={onChange}
          required
        />
      </Container>
      <Container direction="column" gap="none">
        <Button
          on:click={() => {
            if (entryRecord.type == "match") {
              entryRecord.absent = !entryRecord.absent;
              onChange();
            }
          }}
        >
          {#if entryRecord.absent}
            <Icon name="square-check" />
          {:else}
            <Icon style="regular" name="square" />
          {/if}
          Absent
        </Button>
      </Container>
    {/if}

    {#if entryRecord.type != "match" || !entryRecord.absent}
      {#each surveyRecord.fields as field, i (field)}
        {@const previousFields = countPreviousFields(i)}
        {#if field.type == "group"}
          <h2>{field.name}</h2>
          <Container align="end" maxWidth>
            {#each field.fields as innerField, innerFieldIndex (innerField)}
              <FieldValueEditor
                field={innerField}
                bind:value={entryRecord.values[previousFields + innerFieldIndex]}
                {onChange}
              />
            {/each}
          </Container>
        {:else}
          <FieldValueEditor {field} bind:value={entryRecord.values[previousFields]} {onChange} />
        {/if}
      {/each}
    {/if}
  </Container>

  <footer>
    <SubmitDraftDialog {idb} bind:surveyRecord draftRecord={entryRecord} />
    <DeleteDraftDialog {idb} bind:surveyRecord draftRecord={entryRecord} />
  </footer>
{:else}
  <Header backLink="survey/{surveyRecord.id}/entries" title="Entry" iconName="list-ol" />

  <Container direction="column" padding="large">
    <span>Team: {entryRecord.team}</span>
    {#if entryRecord.type == "match"}
      <span>Match: {entryRecord.match}</span>
      <span>Absent: {entryRecord.absent}</span>
    {/if}

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

<style>
  .team {
    width: 130px;
  }

  .match {
    width: 80px;
  }
</style>
