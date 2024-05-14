<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { TimerField } from "$lib/field";

  let {
    field,
    value = $bindable(),
    onchange = undefined,
  }: {
    field: TimerField;
    value: number;
    onchange?: (() => void) | undefined;
  } = $props();

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

<Container direction="column" gap="none">
  {field.name}
  <Container gap="none">
    <Button onclick={running ? pause : start}>
      <Icon name={running ? "pause" : "play"} />
    </Button>
    <span class="number">{value.toFixed(1)}</span>
    <Button onclick={stop}>
      <Icon name="stop" />
    </Button>
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
