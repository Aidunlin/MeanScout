<script lang="ts">
  import type { Field } from "$lib";
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

<Container direction="column" gap="none" maxWidth={field.type == "text"}>
  {#if field.type != "toggle"}
    {field.name}
  {/if}

  {#if field.type == "team"}
    <input class="team" list="teams-list" maxlength="5" bind:value required />
  {:else if field.type == "match"}
    <input class="match" type="number" pattern="[0-9]*" bind:value required />
  {:else if field.type == "toggle"}
    <Container type="button" onClick={() => (value = !value)}>
      {#if value}
        <Icon name="square-check" />
      {:else}
        <Icon style="regular" name="square" />
      {/if}
      {field.name}
    </Container>
  {:else if field.type == "number"}
    <Container gap="none">
      <Container type="button" onClick={() => value--} disabled={field.allowNegative !== true && value < 1}>
        <Icon name="minus" />
      </Container>
      <span class="number">{value}</span>
      <Container type="button" onClick={() => value++}>
        <Icon name="plus" />
      </Container>
    </Container>
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
    <Container gap="none">
      {#each Array(5) as _, i}
        <Container type="button" onClick={() => rate(i)}>
          <Icon style={value > i ? "solid" : "regular"} name="star" />
        </Container>
      {/each}
    </Container>
  {:else if field.type == "timer"}
    <Container gap="none">
      <Container type="button" onClick={running ? pause : start}>
        <Icon name={running ? "pause" : "play"} />
      </Container>
      <span class="number">{value.toFixed(1)}</span>
      <Container type="button" onClick={stop}>
        <Icon name="stop" />
      </Container>
    </Container>
  {/if}
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
