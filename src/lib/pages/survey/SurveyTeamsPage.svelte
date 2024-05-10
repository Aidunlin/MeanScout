<script lang="ts">
  import { type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { tbaAuthKeyStore } from "$lib/settings";
  import { tbaGetEventTeams } from "$lib/tba";

  let {
    idb,
    surveyRecord,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<Survey>;
  } = $props();

  $effect(() => {
    idb.transaction("surveys", "readwrite").objectStore("surveys").put($state.snapshot(surveyRecord));
  });

  let teamInput = $state("");

  async function getTeamsFromTBAEvent() {
    if (!surveyRecord.tbaEventKey) return;

    const response = await tbaGetEventTeams(surveyRecord.tbaEventKey, $tbaAuthKeyStore);
    if (response) {
      surveyRecord.teams = response;
      surveyRecord.modified = new Date();
    }
  }

  function addTeam() {
    if (teamInput.trim() && !surveyRecord.teams.includes(teamInput.trim())) {
      surveyRecord.teams = [...surveyRecord.teams, teamInput.trim()];
      surveyRecord.modified = new Date();
      teamInput = "";
    }
  }

  function deleteTeam(team: string) {
    surveyRecord.teams = surveyRecord.teams.filter((t) => t.trim() != team.trim());
    surveyRecord.modified = new Date();
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Teams" iconName="people-group" />

<Container direction="column" padding="large">
  {#if $tbaAuthKeyStore && surveyRecord.tbaEventKey}
    <Button onclick={getTeamsFromTBAEvent}>
      <Container maxWidth>
        <Icon name="cloud-arrow-down" />
        Get teams from TBA event: {surveyRecord.tbaEventKey}
      </Container>
    </Button>
  {/if}

  <Container direction="column" gap="none">
    Add team
    <Container>
      <input style="width:200px" bind:value={teamInput} onkeydown={(e) => e.key == "Enter" && addTeam()} />
      <Button disabled={!teamInput.trim().length || surveyRecord.teams.includes(teamInput.trim())} onclick={addTeam}>
        <Icon name="plus" />
        Add
      </Button>
    </Container>
  </Container>

  <h2>Teams</h2>
  {#if surveyRecord.teams.length}
    <Container>
      {#each surveyRecord.teams.toSorted((a, b) => a.localeCompare(b, "en", { numeric: true })) as team}
        <Button onclick={() => deleteTeam(team)}>
          {team}
        </Button>
      {/each}
    </Container>
  {:else}
    <span>
      No teams.
      {#if surveyRecord.type == "match" && surveyRecord.matches.length}
        Note that teams from matches are used depending on the selected target.
      {:else}
        Any team value is allowed.
      {/if}
    </span>
  {/if}
</Container>
