<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Field } from "$lib/field";

  export let fields: Field[];
  export let field: Field;
  export let fieldIndex: number;
  export let disabled = false;

  export let onChange: (() => void) | undefined = undefined;

  let dialog: Dialog;

  function duplicateField() {
    fields = fields.toSpliced(fieldIndex, 0, structuredClone(field));
    onChange && onChange();
    dialog.close();
  }

  function deleteField() {
    fields = fields.filter((_, i) => i != fieldIndex);
    onChange && onChange();
    dialog.close();
  }
</script>

<Dialog bind:this={dialog}>
  <Button title="Options" {disabled} slot="opener" let:open on:click={open}>
    <Icon name="ellipsis-vertical" />
  </Button>

  <span>
    Field: {field.name}
    <br />
    Type: {field.type}
  </span>
  <Button on:click={duplicateField}>
    <Container maxWidth>
      <Icon name="clone" />
      Clone field
    </Container>
  </Button>
  <Button on:click={deleteField}>
    <Container maxWidth>
      <Icon name="trash" />
      Delete field
    </Container>
  </Button>
</Dialog>
