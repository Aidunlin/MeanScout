<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import type { TextField } from "$lib/field";

  let {
    field,
    value = $bindable(),
    onchange = undefined,
  }: {
    field: TextField;
    value: string;
    onchange?: (() => void) | undefined;
  } = $props();
</script>

<Container direction="column" gap="none" maxWidth>
  {field.name}
  {#if field.long}
    <textarea placeholder={field.tip} bind:value {onchange}></textarea>
  {:else}
    <input placeholder={field.tip} bind:value {onchange} />
  {/if}
</Container>
