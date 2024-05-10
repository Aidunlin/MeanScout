<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Field } from "$lib/field";

  let {
    field,
    value = $bindable(),
    onchange = undefined,
  }: {
    field: Field;
    value: any;
    onchange?: (() => void) | undefined;
  } = $props();

  function toggle() {
    value = !value;
    onchange && onchange();
  }

  function increment() {
    value++;
    onchange && onchange();
  }

  function decrement() {
    value--;
    onchange && onchange();
  }

  function rate(i: number) {
    if (value == i + 1) {
      value = 0;
    } else {
      value = i + 1;
    }
    onchange && onchange();
  }

  let running = $state(false);
  let interval: number;

  function start() {
    running = true;
    interval = window.setInterval(() => running && (value += 0.1), 100);
    onchange && onchange();
  }

  function pause() {
    running = false;
    clearInterval(interval);
    onchange && onchange();
  }

  function stop() {
    if (running) {
      pause();
    }
    value = 0;
    onchange && onchange();
  }
</script>

<Container direction="column" gap="none" maxWidth={field.type == "text"}>
  {#if field.type != "toggle"}
    {field.name}
  {/if}

  <Container gap="none">
    {#if field.type == "toggle"}
      <Button onclick={toggle}>
        {#if value}
          <Icon name="square-check" />
        {:else}
          <Icon style="regular" name="square" />
        {/if}
        {field.name}
      </Button>
    {:else if field.type == "number"}
      <Button onclick={decrement} disabled={field.allowNegative !== true && value < 1}>
        <Icon name="minus" />
      </Button>
      <span class="number">{value}</span>
      <Button onclick={increment}>
        <Icon name="plus" />
      </Button>
    {:else if field.type == "select"}
      <select bind:value {onchange}>
        {#each field.values as val}
          <option value={val}>{val}</option>
        {/each}
      </select>
    {:else if field.type == "text"}
      {#if field.long}
        <textarea placeholder={field.tip} bind:value {onchange}></textarea>
      {:else}
        <input placeholder={field.tip} bind:value {onchange} />
      {/if}
    {:else if field.type == "rating"}
      {#each Array(5) as _, i}
        <Button star onclick={() => rate(i)}>
          <Icon style={value > i ? "solid" : "regular"} name="star" />
        </Button>
      {/each}
    {:else if field.type == "timer"}
      <Button onclick={running ? pause : start}>
        <Icon name={running ? "pause" : "play"} />
      </Button>
      <span class="number">{value.toFixed(1)}</span>
      <Button onclick={stop}>
        <Icon name="stop" />
      </Button>
    {/if}
  </Container>
</Container>

<style>
  .number {
    background: var(--fg-color);
    padding: var(--inner-gap);
    text-align: center;
    width: 80px;
  }
</style>
