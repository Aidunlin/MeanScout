<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import type { SelectField } from "$lib/field";

  let {
    field,
    value = $bindable(),
    onchange = undefined,
  }: {
    field: SelectField;
    value: string;
    onchange?: (() => void) | undefined;
  } = $props();
</script>

<Container direction="column" gap="none">
  {field.name}
  <select bind:value {onchange}>
    {#each field.values as val}
      <option value={val}>{val}</option>
    {/each}
  </select>
</Container>
