<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Field } from "$lib/field";

  let {
    fields = $bindable(),
    field = $bindable(),
    fieldIndex,
    disabled = false,
    onchange = undefined,
  }: {
    fields: Field[];
    field: Field;
    fieldIndex: number;
    disabled: boolean;
    onchange?: (() => void) | undefined;
  } = $props();

  let dialog: Dialog;

  function duplicateField() {
    fields = fields.toSpliced(fieldIndex, 0, structuredClone($state.snapshot(field)));
    onchange && onchange();
    dialog.close();
  }

  function deleteField() {
    fields = fields.filter((_, i) => i != fieldIndex);
    onchange && onchange();
    dialog.close();
  }
</script>

<Button {disabled} onclick={() => dialog.open()}>
  <Icon name="ellipsis-vertical" />
</Button>

<Dialog bind:this={dialog}>
  <span>
    Field: {field.name}
    <br />
    Type: {field.type}
  </span>
  <Button onclick={duplicateField}>
    <Container maxWidth>
      <Icon name="clone" />
      Clone field
    </Container>
  </Button>
  <Button onclick={deleteField}>
    <Container maxWidth>
      <Icon name="trash" />
      Delete field
    </Container>
  </Button>
</Dialog>
