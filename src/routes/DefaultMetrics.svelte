<script lang="ts">
  import { defaultMetrics, teamWhitelist } from "$lib/stores";
  import Metric from "$lib/Metric.svelte";
</script>

<div class="flex spaced">
  <span class="group">Info</span>
  <div>
    Team
    <input id="metric-team" list="teams-list" maxlength="5" bind:value={$defaultMetrics.team} />
    <datalist id="teams-list">
      {#each $teamWhitelist as team}
        <option value={team} />
      {/each}
    </datalist>
  </div>
  <div>
    Match
    <input id="metric-match" type="number" pattern="[0-9]*" bind:value={$defaultMetrics.match} />
  </div>
  <Metric config={{ name: "Absent", type: "toggle" }} bind:value={$defaultMetrics.isAbsent} />
</div>
