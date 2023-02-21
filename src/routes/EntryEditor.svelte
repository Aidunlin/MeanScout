<script lang="ts">
  import type { Entry } from "$lib/entries";
  import type { Survey } from "$lib/surveys";
  import MetricEditor from "./MetricEditor.svelte";

  export let survey: Survey;
  export let entry: Entry;
</script>

<div class="flex spaced baseline">
  <div>
    Team
    <input id="metric-team" list="teams-list" maxlength="5" bind:value={entry.team} />
    <datalist id="teams-list">
      {#each survey.teams as team}
        <option value={team} />
      {/each}
    </datalist>
  </div>
  <div>
    Match
    <input id="metric-match" type="number" pattern="[0-9]*" bind:value={entry.match} />
  </div>
  <MetricEditor config={{ name: "Absent", type: "toggle" }} bind:value={entry.isAbsent} />
</div>
<div class="flex spaced baseline" class:hide={entry.isAbsent}>
  {#each survey.configs as config, i}
    <MetricEditor {config} bind:value={entry.metrics[i]} />
  {/each}
</div>
