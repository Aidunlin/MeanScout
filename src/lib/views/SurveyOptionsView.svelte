<script lang="ts">
  import type { SurveyStore, Survey } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyStore: SurveyStore;
  export let survey: Survey;

  $: surveyStore.put(survey);

  let teamInput = "";

  function addTeam() {
    if (teamInput.trim() && !survey.teams.includes(teamInput.trim())) {
      survey.teams = [...survey.teams, teamInput.trim()];
      teamInput = "";
    }
  }

  function sortTeams(teams: string[]) {
    return teams.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  }

  function deleteTeam(team: string) {
    survey.teams = survey.teams.filter((t) => t.trim() != team.trim());
  }
</script>

<Header title={survey.name} backLink={"/surveys"} />

<Container padding noGap>
  <Button
    iconName="list-ol"
    title="Entries"
    disableTheme
    on:click={() => (location.hash = `/survey/${survey.id}/entries`)}
  />
  <Button
    iconName="gears"
    title="Configs"
    disableTheme
    on:click={() => (location.hash = `/survey/${survey.id}/configs`)}
  />
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
    {#if survey.teams.length}
      Teams
    {:else}
      No teams added
    {/if}
    <Container>
      {#each sortTeams(survey.teams) as team}
        <Button text={team} title="Delete {team}" on:click={() => deleteTeam(team)} />
      {/each}
    </Container>
  </Container>
</Container>
