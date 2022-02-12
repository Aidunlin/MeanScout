<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let name = "Select";
  export let values = ["Option"];
  export let value = values[0] ?? "";

  function changed() {
    dispatch("update");
  }
</script>

<div>
  {name}
  <select bind:value on:change={changed}>
    {#each values as val}
      <option value={val}>{val}</option>
    {/each}
  </select>
</div>
