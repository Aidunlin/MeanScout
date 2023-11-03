<script lang="ts">
  import type { MetricConfig } from "$lib";
  import Button from "./Button.svelte";
  import Container from "./Container.svelte";

  export let config: MetricConfig;
  export let value: any;

  function rate(i: number) {
    if (value == i + 1) {
      value = 0;
    } else {
      value = i + 1;
    }
  }

  let running = false;
  let interval: number;

  function start() {
    running = true;
    interval = setInterval(() => running && (value += 0.1), 100);
  }

  function pause() {
    running = false;
    clearInterval(interval);
  }

  function stop() {
    if (running) {
      pause();
    }
    value = 0;
  }
</script>

<Container column noGap maxWidth={config.type == "text"}>
  {#if config.type != "toggle"}
    {config.name}
  {/if}

  <Container noGap>
    {#if config.type == "team"}
      <input class="team" list="teams-list" maxlength="5" bind:value required />
    {:else if config.type == "match"}
      <input class="match" type="number" pattern="[0-9]*" bind:value required />
    {:else if config.type == "toggle"}
      <Button
        on:click={() => (value = !value)}
        iconStyle={value ? "solid" : "regular"}
        iconName={value ? "square-check" : "square"}
        text={config.name}
      />
    {:else if config.type == "number"}
      <Button on:click={() => value--} iconName="minus" disabled={config.allowNegative !== true && value < 1} />
      <span class="number">{value}</span>
      <Button on:click={() => value++} iconName="plus" />
    {:else if config.type == "select"}
      <select bind:value>
        {#each config.values as val}
          <option value={val}>{val}</option>
        {/each}
      </select>
    {:else if config.type == "text"}
      {#if config.long}
        <textarea placeholder={config.tip} bind:value />
      {:else}
        <input placeholder={config.tip} bind:value />
      {/if}
    {:else if config.type == "rating"}
      {#each Array(5) as _, i}
        <Button on:click={() => rate(i)} iconStyle={value > i ? "solid" : "regular"} iconName="star" />
      {/each}
    {:else if config.type == "timer"}
      <Button on:click={running ? pause : start} iconName={running ? "pause" : "play"} />
      <span class="number">{value.toFixed(1)}</span>
      <Button on:click={stop} iconName="stop" />
    {/if}
  </Container>
</Container>

<style>
  .team {
    width: 100px;
  }

  .match,
  .number {
    width: 80px;
  }

  .number {
    background: var(--fg-color);
    padding: var(--inner-gap);
    text-align: center;
  }
</style>
