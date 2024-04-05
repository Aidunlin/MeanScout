<script lang="ts">
  import type { Entry } from "$lib";
  import { calculateTeamData, normalizeTeamData, type Expression } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let entriesByTeam: Record<string, IDBRecord<Entry>[]>;
  export let expressions: Expression[];
  export let expression: Expression;

  let sortedTeamData: { team: string; value: number }[] = [];
  let error = "";

  function onOpen() {
    const teamData = calculateTeamData(expression.name, expressions, entriesByTeam);
    const normalizedTeamData = normalizeTeamData(teamData);

    sortedTeamData = Object.keys(normalizedTeamData)
      .map((team) => ({ team, value: normalizedTeamData[team] }))
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
      <Icon name="percent" />
      {expression.name}
    </Container>
  </Button>

  <span>{expression.name}</span>

  {#if sortedTeamData.length}
    <div>
      <table>
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

<style>
  div {
    max-height: 500px;
    overflow: auto;
  }

  table {
    text-align: right;
    width: 100%;
  }

  td,
  th {
    padding: var(--outer-gap);
  }
</style>
