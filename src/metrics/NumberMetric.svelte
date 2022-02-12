<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "../Icon.svelte";

  const dispatch = createEventDispatcher();

  export let name = "Number";
  export let value = 0;

  function increment() {
    value++;
    dispatch("update");
  }

  function decrement() {
    value--;
    dispatch("update");
  }
</script>

<div>
  {name}
  <div class="flex">
    <button on:click={increment}>
      <Icon name="plus" />
    </button>
    <input type="number" class="number" pattern="[0-9]*" bind:value />
    <button on:click={decrement}>
      <Icon name="minus" />
    </button>
  </div>
</div>
