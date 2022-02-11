<script>
  import Icon from "../Icon.svelte";
  export let name = "Number";
  export let value = 0;

  function increment() {
    value++;
  }

  function decrement() {
    if (value > 0) value--;
  }
</script>

<div>
  {name}
  <div class="flex">
    <button on:click={increment}>
      <Icon name="plus" />
    </button>
    <input type="number" class="number" bind:value pattern="[0-9]*" />
    <button on:click={decrement}>
      <Icon name="minus" />
    </button>
  </div>
</div>
