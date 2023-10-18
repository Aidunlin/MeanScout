<script lang="ts">
  import type { IDBRecord, Survey, SurveyStore } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";

  export let surveyStore: SurveyStore;
  export let surveyRecord: IDBRecord<Survey>;

  $: surveyStore.put(surveyRecord);

  let teamInput = "";

  function addTeam() {
    if (teamInput.trim() && !surveyRecord.teams.includes(teamInput.trim())) {
      surveyRecord.teams = [...surveyRecord.teams, teamInput.trim()];
      teamInput = "";
    }
  }

  function sortTeams(teams: string[]) {
    return teams.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  }

  function deleteTeam(team: string) {
    surveyRecord.teams = surveyRecord.teams.filter((t) => t.trim() != team.trim());
  }
</script>

<Container column padding>
  <h2>Options</h2>
  <Container column>
    <Container column noGap>
      Add team
      <input style="width:200px" bind:value={teamInput} on:keydown={(e) => e.key == "Enter" && addTeam()} />
    </Container>
    <span>{surveyRecord.teams.length ? "Teams" : "No teams added"}</span>
    <Container>
      {#each sortTeams(surveyRecord.teams) as team}
        <Button text={team} title="Delete {team}" on:click={() => deleteTeam(team)} />
      {/each}
    </Container>
  </Container>
</Container>
