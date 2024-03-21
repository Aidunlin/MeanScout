<script lang="ts">
  import { type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import GetEventTeamsDialog from "$lib/dialogs/GetEventTeamsDialog.svelte";
  import { tbaKeyStore } from "$lib/settings";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let teamInput = "";

  function addTeam() {
    surveyRecord.modified = new Date();
    if (teamInput.trim() && !surveyRecord.teams.includes(teamInput.trim())) {
      surveyRecord.teams = [...surveyRecord.teams, teamInput.trim()];
      teamInput = "";
    }
  }

  function deleteTeam(team: string) {
    surveyRecord.modified = new Date();
    surveyRecord.teams = surveyRecord.teams.filter((t) => t.trim() != team.trim());
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Teams" iconName="people-group" />

<Container direction="column" padding="large">
  {#if navigator.onLine && $tbaKeyStore}
    <GetEventTeamsDialog bind:surveyRecord />
  {/if}

  <Container direction="column" gap="none">
    Add team
    <Container>
      <input style="width:200px" bind:value={teamInput} on:keydown={(e) => e.key == "Enter" && addTeam()} />
      <Button disabled={!teamInput.trim().length || surveyRecord.teams.includes(teamInput.trim())} on:click={addTeam}>
        <Icon name="plus" />
        Add
      </Button>
    </Container>
  </Container>

  <h2>Teams</h2>
  {#if surveyRecord.teams.length}
    <Container>
      {#each surveyRecord.teams.toSorted((a, b) => a.localeCompare(b, "en", { numeric: true })) as team}
        <Button title="Delete {team}" on:click={() => deleteTeam(team)}>
          {team}
        </Button>
      {/each}
    </Container>
  {:else}
    <span>
      No teams.
      {#if surveyRecord.matches.length}
        Note that teams from matches are used depending on the selected target.
      {:else}
        Any team value is allowed.
      {/if}
    </span>
  {/if}
</Container>
