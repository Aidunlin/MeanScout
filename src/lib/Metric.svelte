<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { MetricConfig } from "./metrics";
  import IconButton from "./IconButton.svelte";

  const dispatch = createEventDispatcher();

  export let config: MetricConfig;
  export let value: any;

  /** (`rating`) function */
  function rate(i: number) {
    if (value == i + 1) {
      value = 0;
    } else {
      value = i + 1;
    }
  }

  /** (`timer`) Whether the timer is running */
  let running = false;
  /** (`timer`) Interval reference for the timer */
  let interval: NodeJS.Timer;

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
    if (config.type == "timer") {
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

{#if config.group}
  <span class="group">{config.group}</span>
{/if}
<div class:max-width={config.type == "text"}>
  {#if config.type != "toggle"}
    {config.name}
  {/if}
  <div class="flex">
    {#if config.type == "toggle"}
      <IconButton on:click={() => (value = !value)} icon={value ? "check" : "nocheck"} text={config.name} />
    {:else if config.type == "number"}
      <IconButton on:click={() => value++} icon="plus" />
      <span class="number">{value}</span>
      <IconButton on:click={() => value--} icon="minus" />
    {:else if config.type == "select"}
      <select bind:value>
        {#each config.values as val}
          <option value={val}>{val}</option>
        {/each}
      </select>
    {:else if config.type == "text"}
      <input placeholder={config.tip} bind:value />
    {:else if config.type == "rating"}
      {#each [...Array(5).keys()] as i}
        <IconButton on:click={() => rate(i)} icon={value > i ? "star" : "nostar"} />
      {/each}
    {:else if config.type == "timer"}
      <IconButton on:click={running ? pause : start} icon={running ? "pause" : "play"} />
      <span class="number">{value}</span>
      <IconButton on:click={stop} icon="stop" />
    {/if}
  </div>
</div>
