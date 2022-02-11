<script>
  import Icon from "../Icon.svelte";

  export let name = "Timer";
  export let value = 0;
  export let running = false;

  let interval = null;

  function toggle() {
    if (running) {
      running = false;
      clearInterval(interval);
    } else {
      running = true;
      interval = setInterval(() => {
        if (running) {
          value = (parseFloat(value) + 0.1).toFixed(1);
        }
      }, 100);
    }
  }

  function reset() {
    if (running) {
      toggle();
    }
    value = 0;
  }
</script>

<div>
  {name}
  <div class="flex">
    <button on:click={toggle}>
      <Icon name={running ? "pause" : "play"} />
    </button>
    <input type="number" class="number" bind:value>
    <button on:click={reset}>
      <Icon name="stop" />
    </button>
  </div>
</div>