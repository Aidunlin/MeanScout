<script lang="ts">
  import { parseValueFromString } from "$lib";
  import type { ConvertExpression } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let expression: ConvertExpression;
  export let converters: {
    from: any;
    to: any;
  }[];
  export let defaultTo: any;

  let dialog: Dialog;

  function onConfirm() {
    expression.converters = structuredClone(converters).map(({ from, to }) => ({
      from: parseValueFromString(from),
      to: parseValueFromString(to),
    }));
    expression.defaultTo = parseValueFromString(structuredClone(defaultTo));
    dialog.close();
  }
</script>

<Dialog bind:this={dialog} {onConfirm} on:close={() => {
  converters = structuredClone(expression.converters);
  defaultTo = structuredClone(expression.defaultTo);
}}>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth gap="small">
      <Icon name="pen" />
      Edit Converters
    </Container>
  </Button>

  Converters
  {#each converters as converter, converterIndex}
    <Container align="end">
      <Button on:click={() => (converters = converters.toSpliced(converterIndex, 1))}>
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
  <Button on:click={() => (converters = [...converters, { from: "", to: "" }])}>
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
