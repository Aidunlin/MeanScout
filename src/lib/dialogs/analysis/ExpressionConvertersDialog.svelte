<script lang="ts">
  import { parseValueFromString } from "$lib";
  import type { ConvertExpression } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  let {
    expression = $bindable(),
    converters,
    defaultTo,
  }: {
    expression: ConvertExpression;
    converters: {
      from: any;
      to: any;
    }[];
    defaultTo: any;
  } = $props();

  let dialog: Dialog;

  function onconfirm() {
    expression.converters = structuredClone($state.snapshot(converters)).map(({ from, to }) => ({
      from: parseValueFromString(from),
      to: parseValueFromString(to),
    }));
    expression.defaultTo = parseValueFromString(structuredClone($state.snapshot(defaultTo)));
    dialog.close();
  }

  function onclose() {
    converters = structuredClone($state.snapshot(expression.converters));
    defaultTo = structuredClone($state.snapshot(expression.defaultTo));
  }
</script>

<Button onclick={() => dialog.open()}>
  <Container maxWidth gap="small">
    <Icon name="pen" />
    Edit Converters
  </Container>
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  Converters
  {#each converters as converter, converterIndex}
    <Container align="end">
      <Button onclick={() => (converters = converters.toSpliced(converterIndex, 1))}>
        <Icon name="trash" />
      </Button>
      <Container gap="none" align="end">
        <Container direction="column" gap="none">
          From
          <input class="converter" bind:value={converter.from} />
        </Container>
        <Container padding="small">
          <Icon name="arrow-right" />
        </Container>
        <Container direction="column" gap="none">
          To
          <input class="converter" bind:value={converter.to} />
        </Container>
      </Container>
    </Container>
  {/each}
  <Button onclick={() => (converters = [...converters, { from: "", to: "" }])}>
    <Container maxWidth>
      <Icon name="plus" />
      New converter
    </Container>
  </Button>
  <Container direction="column" gap="none">
    Default to
    <input bind:value={defaultTo} placeholder="Leave blank to keep input" />
  </Container>
</Dialog>

<style>
  .converter {
    width: 150px;
  }
</style>
