<script>
  export let name = "Select";
  export let values = [...Array(3).keys()];
  export let value = values[0] ?? "";
</script>

<div>
  {name}
  <select bind:value>
    {#each values as val}
      <option value={val}>{val}</option>
    {/each}
  </select>
</div>