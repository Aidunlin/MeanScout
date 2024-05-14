<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { ToggleField } from "$lib/field";

  let {
    field,
    value = $bindable(),
    onchange = undefined,
  }: {
    field: ToggleField;
    value: boolean;
    onchange?: (() => void) | undefined;
  } = $props();

  function toggle() {
    value = !value;
    onchange && onchange();
  }
</script>

<Container direction="column" gap="none">
  <Button onclick={toggle}>
    {#if value}
      <Icon name="square-check" />
    {:else}
      <Icon style="regular" name="square" />
    {/if}
    {field.name}
  </Button>
</Container>
