<script lang="ts">
  import { type IDBRecord, type Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import DeleteMatchDialog from "$lib/dialogs/DeleteMatchDialog.svelte";
    import EditMatchDialog from "$lib/dialogs/EditMatchDialog.svelte";
  import GetEventMatchesDialog from "$lib/dialogs/GetEventMatchesDialog.svelte";
  import NewMatchDialog from "$lib/dialogs/NewMatchDialog.svelte";
  import { tbaKeyStore } from "$lib/tba";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);
</script>

<Header
  parent={{ text: surveyRecord.name, iconName: "list-ul", hash: `survey/${surveyRecord.id}` }}
  current={{ text: "Matches", iconName: "table-list" }}
/>

<Container direction="column" padding="large">
  {#if navigator.onLine && $tbaKeyStore}
    <GetEventMatchesDialog bind:surveyRecord />
  {/if}

  <NewMatchDialog bind:surveyRecord />

  <h2>Matches</h2>
  {#if surveyRecord.matches.length}
    <Container direction="column">
      {#each surveyRecord.matches.toSorted((a, b) => a.number - b.number) as match}
        <Container align="center" maxWidth spaceBetween>
          <Container align="center">
            <span class="match-number">{match.number}</span>
            <Container direction="column" gap="small">
              <Container gap="small">
                <span class="red-team">{match.red1}</span>
                <span class="red-team">{match.red2}</span>
                <span class="red-team">{match.red3}</span>
              </Container>
              <Container gap="small">
                <span class="blue-team">{match.blue1}</span>
                <span class="blue-team">{match.blue2}</span>
                <span class="blue-team">{match.blue3}</span>
              </Container>
            </Container>
          </Container>
          <Container>
            <EditMatchDialog bind:surveyRecord {match} />
            <DeleteMatchDialog bind:surveyRecord {match} />
          </Container>
        </Container>
      {/each}
    </Container>
  {:else}
    <span>No matches.</span>
  {/if}
</Container>

<style>
  .match-number {
    width: 60px;
    text-align: right;
  }

  .red-team,
  .blue-team {
    width: 100px;
    text-align: right;
  }

  .red-team {
    color: var(--red);
  }

  .blue-team {
    color: var(--blue);
  }
</style>
