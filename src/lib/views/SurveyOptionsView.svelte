<script lang="ts">
  import type { Entry, IDBRecord, Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  let teamInput = "";

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

  function hasMigratableEntries() {
    const survey = surveyRecord as IDBRecord<Survey> & { entries?: Entry[] };
    return Array.isArray(survey.entries);
  }

  function migrateEntries() {
    const survey = surveyRecord as IDBRecord<Survey> & { entries?: Entry[] };

    if (!Array.isArray(survey.entries)) {
      return;
    }

    const addTransaction = idb.transaction("entries", "readwrite");
    const entryStore = addTransaction.objectStore("entries");

    for (const entry of survey.entries) {
      entry.surveyId = surveyRecord.id;
      entryStore.add(entry);
    }

    addTransaction.oncomplete = () => {
      delete survey.entries;
      surveyRecord = survey;
    };
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
  {#if hasMigratableEntries()}
    <Container column>
      Migrate entries
      <Container>
        <Button iconName="right-from-bracket" text="Migrate" on:click={migrateEntries} />
      </Container>
    </Container>
  {/if}
</Container>
