<script lang="ts">
  import type { Field } from "$lib";
  import Button from "./Button.svelte";
  import Container from "./Container.svelte";
  import Icon from "./Icon.svelte";

  export let field: Field;
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

<Container column noGap maxWidth={field.type == "text"}>
  {#if field.type != "toggle"}
    {field.name}
  {/if}

  <Container noGap>
    {#if field.type == "team"}
      <input class="team" list="teams-list" maxlength="5" bind:value required />
    {:else if field.type == "match"}
      <input class="match" type="number" pattern="[0-9]*" bind:value required />
    {:else if field.type == "toggle"}
      <Button on:click={() => (value = !value)}>
        {#if value}
          <Icon name="square-check" />
        {:else}
          <Icon style="regular" name="square" />
        {/if}
        {field.name}
      </Button>
    {:else if field.type == "number"}
      <Button on:click={() => value--} disabled={field.allowNegative !== true && value < 1}>
        <Icon name="minus" />
      </Button>
      <span class="number">{value}</span>
      <Button on:click={() => value++}>
        <Icon name="plus" />
      </Button>
    {:else if field.type == "select"}
      <select bind:value>
        {#each field.values as val}
          <option value={val}>{val}</option>
        {/each}
      </select>
    {:else if field.type == "text"}
      {#if field.long}
        <textarea placeholder={field.tip} bind:value />
      {:else}
        <input placeholder={field.tip} bind:value />
      {/if}
    {:else if field.type == "rating"}
      {#each Array(5) as _, i}
        <Button star on:click={() => rate(i)}>
          <Icon style={value > i ? "solid" : "regular"} name="star" />
        </Button>
      {/each}
    {:else if field.type == "timer"}
      <Button on:click={running ? pause : start}>
        <Icon name={running ? "pause" : "play"} />
      </Button>
      <span class="number">{value.toFixed(1)}</span>
      <Button on:click={stop}>
        <Icon name="stop" />
      </Button>
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
