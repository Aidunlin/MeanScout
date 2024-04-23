<script lang="ts">
  import type { Entry, MatchEntry, Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { flattenFields, getDefaultFieldValue } from "$lib/field";
  import { targetStore } from "$lib/settings";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryRecords: IDBRecord<Entry>[];

  const flattenedFields = flattenFields(surveyRecord.fields);

  let dialog: Dialog;
  let match = 0;
  let team = "";
  let absent = false;
  let error = "";

  $: suggestedTeams = suggestTeams(match);

  function onOpen() {
    match =
      1 +
      Math.max(
        ...entryRecords
          .filter((entry): entry is IDBRecord<MatchEntry> => entry.type == "match")
          .map((entry) => entry.match),
        0,
      );
  }

  function suggestTeams(matchValue: number) {
    const teamSet = new Set<string>();

    if (surveyRecord.type == "match") {
      const matchData = surveyRecord.matches.find((match) => match.number == matchValue);

      if (matchData) {
        switch ($targetStore) {
          case "red 1":
            team = matchData.red1;
            teamSet.add(team);
            break;
          case "red 2":
            team = matchData.red2;
            teamSet.add(team);
            break;
          case "red 3":
            team = matchData.red3;
            teamSet.add(team);
            break;
          case "blue 1":
            team = matchData.blue1;
            teamSet.add(team);
            break;
          case "blue 2":
            team = matchData.blue2;
            teamSet.add(team);
            break;
          case "blue 3":
            team = matchData.blue3;
            teamSet.add(team);
            break;
          default:
            teamSet.add(matchData.red1);
            teamSet.add(matchData.red2);
            teamSet.add(matchData.red3);
            teamSet.add(matchData.blue1);
            teamSet.add(matchData.blue2);
            teamSet.add(matchData.blue3);
        }
      }
    }

    surveyRecord.teams.forEach((team) => teamSet.add(team));

    return [...teamSet].toSorted((a, b) => parseInt(a) - parseInt(b));
  }

  function onConfirm() {
    team = team.trim();

    const teamHasInvalidFormat = !/^\d{1,5}[A-Z]?$/.test(team);
    const teamIsNotListed = suggestedTeams.length && !suggestedTeams.includes(team);

    if (teamHasInvalidFormat) {
      error = "invalid value for team";
      return;
    }

    if (teamIsNotListed) {
      error = "team is not listed";
      return;
    }

    if (surveyRecord.type == "match") {
      if (!/\d{1,3}/.test(`${match}`)) {
        error = "invalid value for match";
        return;
      }

      if (surveyRecord.matches.length && !surveyRecord.matches.some((m) => m.number == match)) {
        error = "match is not listed";
        return;
      }
    }

    const defaultValues = flattenedFields.map((field) => {
      switch (field.type) {
        case "select":
          return field.values[0];
        default:
          return getDefaultFieldValue(field);
      }
    });

    if (surveyRecord.type == "match") {
      var entry: Entry = {
        surveyId: surveyRecord.id,
        type: surveyRecord.type,
        status: absent ? "submitted" : "draft",
        team,
        match,
        absent,
        values: defaultValues,
        created: new Date(),
        modified: new Date(),
      };
    } else if (surveyRecord.type == "pit") {
      var entry: Entry = {
        surveyId: surveyRecord.id,
        type: surveyRecord.type,
        status: "draft",
        team,
        values: defaultValues,
        created: new Date(),
        modified: new Date(),
      };
    } else {
      return;
    }

    const addRequest = idb.transaction("entries", "readwrite").objectStore("entries").add(entry);
    addRequest.onsuccess = () => {
      const id = addRequest.result;
      if (id == undefined) return;

      surveyRecord.modified = new Date();

      if (absent) {
        dialog.close();
      } else {
        location.hash = `/entry/${id}`;
      }
    };
  }
</script>

<Dialog
  bind:this={dialog}
  {onOpen}
  {onConfirm}
  on:close={() => {
    team = "";
    match = 0;
    absent = false;
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="plus" />
      New entry
    </Container>
  </Button>

  <span>New entry</span>

  <datalist id="teams-list">
    {#each suggestedTeams as team}
      <option value={team} />
    {/each}
  </datalist>
  <Container direction="column" gap="none">
    Team
    <input list="teams-list" bind:value={team} />
  </Container>

  {#if surveyRecord.type == "match"}
    <Container direction="column" gap="none">
      Match
      <input type="number" bind:value={match} />
    </Container>
    <Button on:click={() => (absent = !absent)}>
      <Container gap="small" maxWidth>
        {#if absent}
          <Icon name="square-check" />
        {:else}
          <Icon style="regular" name="square" />
        {/if}
        Absent
      </Container>
    </Button>
  {/if}

  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
