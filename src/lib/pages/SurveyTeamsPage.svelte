<script lang="ts">
  import { type IDBRecord, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { fetchTBA, tbaKeyStore } from "$lib/tba";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let eventInput = "";
  let getTeamsOutput = "";

  let teamInput = "";

  async function getTeamsFromEvent() {
    getTeamsOutput = "Loading...";

    if (!navigator.onLine) {
      getTeamsOutput = "Error: offline";
      return;
    }

    let response = await fetchTBA(`/event/${eventInput.trim()}/teams/keys`, $tbaKeyStore);

    if (response.status == "success" && Array.isArray(response.data)) {
      response.data.forEach((team) => {
        let teamString = `${team}`.trim().replace("frc", "");
        if (!surveyRecord.teams.includes(teamString)) {
          surveyRecord.teams = [...surveyRecord.teams, teamString];
        }
      });
      getTeamsOutput = "Success";
    } else if (response.status == "not found") {
      getTeamsOutput = "Error: could not find event";
    } else {
      getTeamsOutput = "Error";
    }
  }

  function addTeam() {
    if (teamInput.trim() && !surveyRecord.teams.includes(teamInput.trim())) {
      surveyRecord.teams = [...surveyRecord.teams, teamInput.trim()];
      teamInput = "";
    }
  }

  function sortTeams(teams: string[]) {
    return teams.toSorted((a, b) => a.localeCompare(b, "en", { numeric: true }));
  }

  function deleteTeam(team: string) {
    surveyRecord.teams = surveyRecord.teams.filter((t) => t.trim() != team.trim());
  }
</script>

<Header
  parent={{ text: surveyRecord.name, iconName: "list-ul", hash: `survey/${surveyRecord.id}` }}
  current={{ text: "Teams", iconName: "people-group" }}
/>

<Container direction="column" padding="large">
  {#if navigator.onLine && $tbaKeyStore}
    <Container direction="column" gap="none">
      Get teams from TBA Event
      <Container align="center">
        <input
          style="width:200px"
          bind:value={eventInput}
          on:keydown={(e) => e.key == "Enter" && getTeamsFromEvent()}
        />
        <Button disabled={!eventInput.trim().length || getTeamsOutput == "Loading..."} on:click={getTeamsFromEvent}>
          <Icon name="cloud-arrow-down" />
          Get
        </Button>
        {#if getTeamsOutput}
          <span>{getTeamsOutput}</span>
        {/if}
      </Container>
    </Container>
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
      {#each sortTeams(surveyRecord.teams) as team}
        <Button title="Delete {team}" on:click={() => deleteTeam(team)}>
          {team}
        </Button>
      {/each}
    </Container>
  {:else}
    <span>No teams. Any team value is allowed.</span>
  {/if}
</Container>
