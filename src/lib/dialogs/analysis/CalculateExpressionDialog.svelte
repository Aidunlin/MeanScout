<script lang="ts">
  import type { Entry } from "$lib";
  import { calculateTeamData, normalizeTeamData, type Expression } from "$lib/analysis";
  import Dialog from "$lib/components/Dialog.svelte";

  export let entriesByTeam: Record<string, IDBRecord<Entry>[]>;
  export let expressions: Expression[];

  let dialog: Dialog;
  let expression: Expression = { name: "", type: "average", inputs: [] };
  let sortedTeamData: { team: string; percentage: number; value: number }[] = [];
  let error = "";

  export function open(index: number) {
    expression = expressions[index];

    const teamData = calculateTeamData(expression.name, expressions, entriesByTeam);
    const normalizedTeamData = normalizeTeamData(teamData);

    sortedTeamData = Object.keys(normalizedTeamData)
      .map((team) => ({ team, percentage: normalizedTeamData[team], value: teamData[team] }))
      .toSorted((a, b) => b.value - a.value);

    dialog.open();
  }

  function onClose() {
    expression = { name: "", type: "average", inputs: [] };
    sortedTeamData = [];
    error = "";
  }
</script>

<Dialog bind:this={dialog} on:close={onClose}>
  <span>{expression.name}</span>

  {#if sortedTeamData.length}
    <div class="dialog-overflow">
      <table class="team-rank-table">
        <tr>
          <th>Rank</th>
          <th>Team</th>
          <th>Value</th>
          <th>Percent</th>
        </tr>
        {#each sortedTeamData as teamValue, i}
          <tr>
            <td>{i + 1}</td>
            <td>{teamValue.team}</td>
            <td>{teamValue.value.toFixed(2)}</td>
            <td>{teamValue.percentage.toFixed(2)}%</td>
          </tr>
        {/each}
      </table>
    </div>
  {/if}

  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
