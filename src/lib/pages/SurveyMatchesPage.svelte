<script lang="ts">
  import { type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import DeleteMatchDialog from "$lib/dialogs/DeleteMatchDialog.svelte";
  import EditMatchDialog from "$lib/dialogs/EditMatchDialog.svelte";
  import NewMatchDialog from "$lib/dialogs/NewMatchDialog.svelte";
  import { tbaAuthKeyStore } from "$lib/settings";
  import { tbaGetEventMatches } from "$lib/tba";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  async function getMatchesFromTBAEvent() {
    if (!surveyRecord.tbaEventKey) return;

    const response = await tbaGetEventMatches(surveyRecord.tbaEventKey, $tbaAuthKeyStore);
    if (response) {
      surveyRecord.matches = response;
      surveyRecord.modified = new Date();
    }
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Matches" iconName="table-list" />

<Container direction="column" padding="large">
  {#if navigator.onLine && $tbaAuthKeyStore && surveyRecord.tbaEventKey}
    <Button on:click={getMatchesFromTBAEvent}>
      <Container maxWidth>
        <Icon name="cloud-arrow-down" />
        Get matches from TBA event: {surveyRecord.tbaEventKey}
      </Container>
    </Button>
  {/if}

  <NewMatchDialog bind:surveyRecord />

  <h2>Matches</h2>
  {#if surveyRecord.matches.length}
    <Container>
      <table>
        <tr>
          <th colspan="2" class="match-number">Match</th>
          <th colspan="3">Teams</th>
        </tr>
        {#each surveyRecord.matches.toSorted((a, b) => a.number - b.number) as match}
          <tr>
            <td>
              <Container padding="small" gap="small">
                <EditMatchDialog bind:surveyRecord {match} />
                <DeleteMatchDialog bind:surveyRecord {match} />
              </Container>
            </td>
            <td class="match-number">{match.number}</td>
            <td>
              <Container direction="column" padding="small" gap="small">
                <span class="red-team">{match.red1}</span>
                <span class="blue-team">{match.blue1}</span>
              </Container>
            </td>
            <td>
              <Container direction="column" padding="small" gap="small">
                <span class="red-team">{match.red2}</span>
                <span class="blue-team">{match.blue2}</span>
              </Container>
            </td>
            <td>
              <Container direction="column" padding="small" gap="small">
                <span class="red-team">{match.red3}</span>
                <span class="blue-team">{match.blue3}</span>
              </Container>
            </td>
          </tr>
        {/each}
      </table>
    </Container>
  {:else}
    <span>No matches.</span>
  {/if}
</Container>

<style>
  td.match-number {
    padding: var(--outer-gap);
  }

  .match-number,
  .red-team,
  .blue-team {
    text-align: right;
  }

  td .red-team {
    color: var(--red);
  }

  td .blue-team {
    color: var(--blue);
  }
</style>
