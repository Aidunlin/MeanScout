<script lang="ts">
  import Button from "$lib/Button.svelte";
  import Container from "$lib/Container.svelte";
  import type { MetricConfig } from "$lib/metrics";
  import { createEventDispatcher } from "svelte";

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
  <h2>{config.group}</h2>
{/if}

<Container column noGap maxWidth={config.type == "text"}>
  {#if config.type != "toggle"}
    {config.name}
  {/if}

  <Container noGap>
    {#if config.type == "toggle"}
      <Button on:click={() => (value = !value)} icon={value ? "check" : "nocheck"} text={config.name} />
    {:else if config.type == "number"}
      <Button on:click={() => value++} icon="plus" />
      <span class="number">{value}</span>
      <Button on:click={() => value--} icon="minus" />
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
        <Button on:click={() => rate(i)} icon={value > i ? "star" : "nostar"} />
      {/each}
    {:else if config.type == "timer"}
      <Button on:click={running ? pause : start} icon={running ? "pause" : "play"} />
      <span class="number">{value}</span>
      <Button on:click={stop} icon="stop" />
    {/if}
  </Container>
</Container>
