<script lang="ts">
  import { fetchTBA, type Match, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import DeleteMatchDialog from "$lib/dialogs/DeleteMatchDialog.svelte";
  import EditMatchDialog from "$lib/dialogs/EditMatchDialog.svelte";
  import NewMatchDialog from "$lib/dialogs/NewMatchDialog.svelte";
  import { tbaKeyStore } from "$lib/settings";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  async function getMatchesFromTBAEvent() {
    let response = await fetchTBA(`/event/${surveyRecord.tbaEventKey}/matches/simple`, $tbaKeyStore);
    if (response.status == "success" && Array.isArray(response.data)) {
      surveyRecord.matches = response.data
        .filter((match) => match.comp_level == "qm")
        .map((match): Match => {
          return {
            number: match.match_number,
            red1: match.alliances.red.team_keys[0].replace("frc", ""),
            red2: match.alliances.red.team_keys[1].replace("frc", ""),
            red3: match.alliances.red.team_keys[2].replace("frc", ""),
            blue1: match.alliances.blue.team_keys[0].replace("frc", ""),
            blue2: match.alliances.blue.team_keys[1].replace("frc", ""),
            blue3: match.alliances.blue.team_keys[2].replace("frc", ""),
          };
        });
      surveyRecord.modified = new Date();
    }
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Matches" iconName="table-list" />

<Container direction="column" padding="large">
  {#if navigator.onLine && $tbaKeyStore && surveyRecord.tbaEventKey}
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
