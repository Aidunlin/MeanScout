<script lang="ts">
  import { indexes, surveyPage, surveys } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyIndex: number;

  let teamInput = "";

  function addTeam() {
    if (teamInput.trim() && !$surveys[surveyIndex].teams.includes(teamInput.trim())) {
      $surveys[surveyIndex].teams = [...$surveys[surveyIndex].teams, teamInput.trim()];
      teamInput = "";
    }
  }

  function sortTeams(teams: string[]) {
    return teams.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  }

  function deleteTeam(team: string) {
    $surveys[surveyIndex].teams = $surveys[surveyIndex].teams.filter((t) => t.trim() != team.trim());
  }
</script>

<Header title={$surveys[surveyIndex].name}>
  <Button iconName="arrow-left" title="Back to surveys" on:click={() => ($indexes.survey = undefined)} />
</Header>

<Container padding noGap>
  <Button iconName="list-ol" title="Entries" disableTheme on:click={() => ($surveyPage = "entries")} />
  <Button iconName="gears" title="Configs" disableTheme on:click={() => ($surveyPage = "configs")} />
  <Button iconName="ellipsis-vertical" title="Options" />
</Container>

<Container column padding>
  <h2>Options</h2>
  <Container column>
    <Container column noGap>
      Add team
      <input
        style="width:200px"
        bind:value={teamInput}
        on:keydown={(e) => {
          if (e.key == "Enter") addTeam();
        }}
      />
    </Container>
    {#if $surveys[surveyIndex].teams.length}
      Teams
    {:else}
      No teams added
    {/if}
    <Container>
      {#each sortTeams($surveys[surveyIndex].teams) as team}
        <Button text={team} title="Delete {team}" on:click={() => deleteTeam(team)} />
      {/each}
    </Container>
  </Container>
</Container>
