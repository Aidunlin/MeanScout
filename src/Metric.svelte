<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "./Icon.svelte";

  const dispatch = createEventDispatcher();

  /** (required) The custom name of the metric */
  export let name = "";
  /** (required) The type of the metric */
  export let type = "";
  /** The value stored by the metric */
  export let value = null;
  /** (optional) Group name for this and subsequent metrics */
  export let group = "";

  /** (`select`, required) Possible metric values */
  export let values = [];
  /** (`text`, optional) Placeholder text */
  export let tip = "";

  /** (`timer`) Whether the timer is running */
  let running = false;
  /** (`timer`) Interval reference for the timer */
  let interval = null;

  /** (`toggle` function) */
  function toggle() {
    value = !value;
  }

  /** (`number` function) */
  function increment() {
    value++;
  }

  /** (`number` function) */
  function decrement() {
    value--;
  }

  /** (`rating` function) */
  function update(newValue) {
    value = newValue;
  }

  /** (`timer` function) */
  function start() {
    running = true;
    interval = setInterval(() => {
      if (running) {
        value = (parseFloat(value) + 0.1).toFixed(1);
      }
    }, 100);
  }

  /** (`timer` function) */
  function pause() {
    running = false;
    clearInterval(interval);
  }

  /** (`timer` function) */
  function stop() {
    if (type == "timer") {
      if (running) {
        pause();
      }

      value = 0;
    }
  }

  // Svelte calls `dispatch()` whenever `value` changes
  $: {
    value;
    dispatch("update");
  }
</script>

{#if group}
  <span class="group">{group}</span>
{/if}
<div class:max-width={type == "text"}>
  {#if type != "toggle"}
    {name}
  {/if}
  <div class="flex">
    {#if type == "toggle"}
      <button on:click={toggle}>
        <Icon name={value ? "check" : "nocheck"} text={name} />
      </button>
    {:else if type == "number"}
      <button on:click={increment}>
        <Icon name="plus" />
      </button>
      <span class="number">{value}</span>
      <button on:click={decrement}>
        <Icon name="minus" />
      </button>
    {:else if type == "select"}
      <select bind:value>
        {#each values as val}
          <option value={val}>{val}</option>
        {/each}
      </select>
    {:else if type == "text"}
      <input placeholder={tip} bind:value />
    {:else if type == "rating"}
      {#each [...Array(5).keys()] as i}
        <button on:click={() => update(i)}>
          <Icon name={value >= i ? "star" : "nostar"} />
        </button>
      {/each}
    {:else if type == "timer"}
      <button on:click={running ? pause : start}>
        <Icon name={running ? "pause" : "play"} />
      </button>
      <span class="number">{value}</span>
      <button on:click={stop}>
        <Icon name="stop" />
      </button>
    {/if}
  </div>
</div>
