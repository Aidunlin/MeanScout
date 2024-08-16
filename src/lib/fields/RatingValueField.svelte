<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { RatingField } from "$lib/field";

  let {
    field,
    value = $bindable(),
    onchange = undefined,
  }: {
    field: RatingField;
    value: number;
    onchange?: (() => void) | undefined;
  } = $props();

  function rate(i: number) {
    if (value == i + 1) {
      value = 0;
    } else {
      value = i + 1;
    }
    onchange && onchange();
  }
</script>

<Container direction="column" gap="none">
  {field.name}
  <Container gap="none">
    {#each Array(5) as _, i}
      <Button star onclick={() => rate(i)}>
        <Icon style={value > i ? "solid" : "regular"} name="star" />
      </Button>
    {/each}
  </Container>
</Container>
