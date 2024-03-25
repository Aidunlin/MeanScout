<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Field } from "$lib/field";

  export let field: Field;
  export let value: any;

  export let onChange: (() => void) | undefined = undefined;

  function toggle() {
    value = !value;
    onChange && onChange();
  }

  function increment() {
    value++;
    onChange && onChange();
  }

  function decrement() {
    value--;
    onChange && onChange();
  }

  function rate(i: number) {
    if (value == i + 1) {
      value = 0;
    } else {
      value = i + 1;
    }
    onChange && onChange();
  }

  let running = false;
  let interval: number;

  function start() {
    running = true;
    interval = setInterval(() => running && (value += 0.1), 100);
    onChange && onChange();
  }

  function pause() {
    running = false;
    clearInterval(interval);
    onChange && onChange();
  }

  function stop() {
    if (running) {
      pause();
    }
    value = 0;
    onChange && onChange();
  }
</script>

<Container direction="column" gap="none" maxWidth={field.type == "text"}>
  {#if field.type != "toggle"}
    {field.name}
  {/if}

  <Container gap="none">
    {#if field.type == "team"}
      <input class="team" list="teams-list" maxlength="5" bind:value on:change={onChange} required />
    {:else if field.type == "match"}
      <input class="match" type="number" pattern="[0-9]*" bind:value on:change={onChange} required />
    {:else if field.type == "toggle"}
      <Button on:click={toggle}>
        {#if value}
          <Icon name="square-check" />
        {:else}
          <Icon style="regular" name="square" />
        {/if}
        {field.name}
      </Button>
    {:else if field.type == "number"}
      <Button on:click={decrement} disabled={field.allowNegative !== true && value < 1}>
        <Icon name="minus" />
      </Button>
      <span class="number">{value}</span>
      <Button on:click={increment}>
        <Icon name="plus" />
      </Button>
    {:else if field.type == "select"}
      <select bind:value on:change={onChange}>
        {#each field.values as val}
          <option value={val}>{val}</option>
        {/each}
      </select>
    {:else if field.type == "text"}
      {#if field.long}
        <textarea placeholder={field.tip} bind:value on:change={onChange} />
      {:else}
        <input placeholder={field.tip} bind:value on:change={onChange} />
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
    width: 130px;
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
