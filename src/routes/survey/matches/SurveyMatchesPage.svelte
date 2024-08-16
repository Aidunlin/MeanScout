<script lang="ts">
  import type { MatchSurvey } from "$lib/survey";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { tbaAuthKeyStore } from "$lib/settings";
  import { tbaGetEventMatches } from "$lib/tba";
  import DeleteMatchDialog from "./DeleteMatchDialog.svelte";
  import MatchDialog from "./MatchDialog.svelte";

  let {
    idb,
    surveyRecord,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<MatchSurvey>;
  } = $props();

  $effect(() => {
    idb.transaction("surveys", "readwrite").objectStore("surveys").put($state.snapshot(surveyRecord));
  });

  let matchDialog: MatchDialog;

  async function getMatchesFromTBAEvent() {
    if (!surveyRecord.tbaEventKey) return;

    const response = await tbaGetEventMatches(surveyRecord.tbaEventKey, $tbaAuthKeyStore);
    if (response) {
      surveyRecord.matches = response;
      surveyRecord.modified = new Date();
    }
  }

  let show = $state(false);
  setTimeout(() => (show = true), 0);
</script>

<Header backLink="survey/{surveyRecord.id}" title="Matches" iconName="table-list" />

<Container direction="column" padding="large">
  {#if $tbaAuthKeyStore && surveyRecord.tbaEventKey}
    <Button onclick={getMatchesFromTBAEvent}>
      <Container maxWidth>
        <Icon name="cloud-arrow-down" />
        Get matches from TBA event: {surveyRecord.tbaEventKey}
      </Container>
    </Button>
  {/if}

  <MatchDialog bind:this={matchDialog} bind:surveyRecord />

  <h2>Matches</h2>
  {#if show && surveyRecord.matches.length}
    <Container>
      <table>
        <thead>
          <tr>
            <th colspan="2" class="match-number">Match</th>
            <th colspan="3">Teams</th>
          </tr>
        </thead>
        <tbody>
          {#each surveyRecord.matches.toSorted((a, b) => a.number - b.number) as match}
            <tr>
              <td>
                <Container padding="small" gap="small">
                  <Button onclick={() => matchDialog.editMatch(match.number)}>
                    <Icon name="pen" />
                  </Button>
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
        </tbody>
      </table>
    </Container>
  {:else if show}
    <span>No matches.</span>
  {:else}
    <span>Loading...</span>
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
