<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "../Icon.svelte";

  const dispatch = createEventDispatcher();

  export let name = "Rating";
  export let value = 0;
  export let count = 5;

  function update(newValue) {
    value = newValue;
    dispatch("update");
  }
</script>

<div>
  {name}
  <div class="flex">
    {#each [...Array(count).keys()] as i}
      <button class="star" on:click={() => update(i)}>
        <Icon name="star-{value >= i ? 'filled' : 'empty'}" />
      </button>
    {/each}
  </div>
</div>
