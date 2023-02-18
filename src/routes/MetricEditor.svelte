<script lang="ts">
  import type { MetricConfig } from "$lib/metrics";
  import { createEventDispatcher } from "svelte";
  import IconButton from "./IconButton.svelte";

  const dispatch = createEventDispatcher();

  export let config: MetricConfig;
  export let value: any;

  $: {
    value;
    dispatch("update");
  }

  function rate(i: number) {
    if (value == i + 1) {
      value = 0;
    } else {
      value = i + 1;
    }
  }

  let running = false;
  let interval: NodeJS.Timer;

  function start() {
    running = true;
    interval = setInterval(() => {
      if (running) {
        value = (parseFloat(value) + 0.1).toFixed(1);
      }
    }, 100);
  }

  function pause() {
    running = false;
    clearInterval(interval);
  }

  function stop() {
    if (config.type == "timer") {
      if (running) {
        pause();
      }
      value = 0;
    }
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
