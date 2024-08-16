<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { NumberField } from "$lib/field";

  let {
    field,
    value = $bindable(),
    onchange = undefined,
  }: {
    field: NumberField;
    value: number;
    onchange?: (() => void) | undefined;
  } = $props();

  function increment() {
    value++;
    onchange && onchange();
  }

  function decrement() {
    value--;
    onchange && onchange();
  }
</script>

<Container direction="column" gap="none">
  {field.name}
  <Container gap="none">
    <Button onclick={decrement} disabled={field.allowNegative !== true && value < 1}>
      <Icon name="minus" />
    </Button>
    <span class="number">{value}</span>
    <Button onclick={increment}>
      <Icon name="plus" />
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
