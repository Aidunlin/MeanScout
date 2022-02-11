<script>
  import Icon from "../Icon.svelte";

  export let name = "Rating";
  export let value = 0;

  function update(newValue) {
    value = newValue;
  }
</script>

<div>
  {name}
  <div class="flex">
    {#each [...Array(5).keys()] as i}
      <button class="star" on:click={() => update(i)}>
        <Icon name="star-{value >= i ? "filled" : "empty"}" />
      </button>
    {/each}
  </div>
</div>