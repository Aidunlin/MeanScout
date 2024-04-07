<script lang="ts">
  import type { Entry } from "$lib";
  import { calculateTeamData, normalizeTeamData, type Expression, type PickList } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let entriesByTeam: Record<string, IDBRecord<Entry>[]>;
  export let expressions: Expression[];
  export let pickList: PickList;

  let sortedTeamData: { team: string; value: number }[] = [];
  let error = "";

  function onOpen() {
    const pickListData: Record<string, number> = {};
    for (const team in entriesByTeam) {
      pickListData[team] = 0;
    }

    for (const { percentage, expressionName } of pickList.weights) {
      const teamData = calculateTeamData(expressionName, expressions, entriesByTeam);
      const normalizedTeamData = normalizeTeamData(teamData, percentage);

      for (const team in normalizedTeamData) {
        pickListData[team] += normalizedTeamData[team];
      }
    }

    const normalizedPickListData = normalizeTeamData(pickListData);

    sortedTeamData = Object.keys(normalizedPickListData)
      .map((team) => ({ team, value: normalizedPickListData[team] }))
      .toSorted((a, b) => b.value - a.value);
  }
</script>

<Dialog
  {onOpen}
  on:close={() => {
    sortedTeamData = [];
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container gap="small" maxWidth>
      <Icon name="list-ol" />
      {pickList.name}
    </Container>
  </Button>

  <span>{pickList.name}</span>

  {#if sortedTeamData.length}
    <div class="dialog-overflow">
      <table class="team-rank-table">
        <tr>
          <th>Rank</th>
          <th>Team</th>
          <th>Percent</th>
        </tr>
        {#each sortedTeamData as teamValue, i}
          <tr>
            <td>{i + 1}</td>
            <td>{teamValue.team}</td>
            <td>{teamValue.value.toFixed(2)}%</td>
          </tr>
        {/each}
      </table>
    </div>
  {/if}

  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
