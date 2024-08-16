<script lang="ts">
  import type { Field } from "$lib/field";
  import NumberValueField from "$lib/fields/NumberValueField.svelte";
  import RatingValueField from "$lib/fields/RatingValueField.svelte";
  import SelectValueField from "$lib/fields/SelectValueField.svelte";
  import TextValueField from "$lib/fields/TextValueField.svelte";
  import TimerValueField from "$lib/fields/TimerValueField.svelte";
  import ToggleValueField from "$lib/fields/ToggleValueField.svelte";

  let {
    field,
    value = $bindable(),
    onchange = undefined,
  }: {
    field: Field;
    value: any;
    onchange?: (() => void) | undefined;
  } = $props();
</script>

{#if field.type == "toggle"}
  <ToggleValueField {field} bind:value {onchange} />
{:else if field.type == "number"}
  <NumberValueField {field} bind:value {onchange} />
{:else if field.type == "select"}
  <SelectValueField {field} bind:value {onchange} />
{:else if field.type == "text"}
  <TextValueField {field} bind:value {onchange} />
{:else if field.type == "rating"}
  <RatingValueField {field} bind:value {onchange} />
{:else if field.type == "timer"}
  <TimerValueField {field} bind:value {onchange} />
{/if}
