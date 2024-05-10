<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import FieldOptionsDialog from "$lib/dialogs/FieldOptionsDialog.svelte";
  import { fieldTypes, type Field } from "$lib/field";

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
    onchange: (() => void) | undefined;
  } = $props();

  function switchFieldType(to: string) {
    switch (to) {
      case "toggle":
      case "number":
      case "text":
      case "rating":
      case "timer":
        field = {
          name: field.name,
          type: to,
        };
        break;
      case "select":
        field = {
          name: field.name,
          type: to,
          values: [],
        };
        break;
      case "group":
        field = {
          name: field.name,
          type: to,
          fields: [],
        };
        break;
    }
    onchange && onchange();
  }

  function moveField(by: number) {
    fields = fields.toSpliced(fieldIndex + by, 0, ...fields.splice(fieldIndex, 1));
    onchange && onchange();
  }

  function toggleAllowNegative() {
    if (field.type == "number") {
      field.allowNegative = !field.allowNegative;
      onchange && onchange();
    }
  }

  function deleteSelectValue(index: number) {
    if (field.type == "select") {
      field.values = field.values.filter((_, i) => i != index);
      onchange && onchange();
    }
  }

  function newSelectValue() {
    if (field.type == "select") {
      field.values = [...field.values, ""];
      onchange && onchange();
    }
  }

  function toggleLong() {
    if (field.type == "text") {
      field.long = !field.long;
      onchange && onchange();
    }
  }

  function newField() {
    if (field.type == "group") {
      field.fields = [...field.fields, { name: "", type: "toggle" }];
      onchange && onchange();
    }
  }
</script>

<Container direction="column" padding="large">
  <Container>
    <Container direction="column" gap="none">
      Name
      <input bind:value={field.name} {onchange} {disabled} />
    </Container>
    <Container direction="column" gap="none">
      Type
      <select value={field.type} onchange={(e) => switchFieldType(e.currentTarget.value)} {disabled}>
        {#each fieldTypes as fieldType}
          <option>{fieldType}</option>
        {/each}
      </select>
    </Container>
  </Container>

  <Container>
    <Button disabled={fieldIndex == 0 || disabled} onclick={() => moveField(-1)}>
      <Icon name="arrow-up" />
    </Button>
    <Button disabled={fieldIndex == fields.length - 1 || disabled} onclick={() => moveField(1)}>
      <Icon name="arrow-down" />
    </Button>
    <FieldOptionsDialog bind:fields bind:field {fieldIndex} {disabled} {onchange} />
  </Container>

  {#if !disabled}
    {#if field.type == "number"}
      <Container direction="column" padding="large" maxWidth>
        <Container>
          <Button onclick={toggleAllowNegative}>
            {#if field.allowNegative}
              <Icon name="square-check" />
            {:else}
              <Icon style="regular" name="square" />
            {/if}
            Allow negative
          </Button>
        </Container>
      </Container>
    {:else if field.type == "select"}
      <Container direction="column" padding="large" maxWidth>
        {field.name} Values
        {#each field.values as _, i}
          <Container>
            <input bind:value={field.values[i]} {onchange} style="width:200px" />
            <Button onclick={() => deleteSelectValue(i)}>
              <Icon name="trash" />
            </Button>
          </Container>
        {/each}
        <Container>
          <Button onclick={newSelectValue}>
            <Icon name="plus" />
          </Button>
        </Container>
      </Container>
    {:else if field.type == "text"}
      <Container direction="column" padding="large" maxWidth>
        <Container align="end">
          <Container direction="column" gap="none">
            Tip
            <input bind:value={field.tip} {onchange} />
          </Container>
          <Button onclick={toggleLong}>
            {#if field.long}
              <Icon name="square-check" />
            {:else}
              <Icon style="regular" name="square" />
            {/if}
            Long
          </Button>
        </Container>
      </Container>
    {:else if field.type == "group"}
      <Container direction="column" padding="large" maxWidth>
        {field.name} Fields
        {#each field.fields as innerField, innerFieldIndex (innerField)}
          <svelte:self
            bind:fields={field.fields}
            bind:field={field.fields[innerFieldIndex]}
            onChange={onchange}
            fieldIndex={innerFieldIndex}
          />
        {/each}
        <Container>
          <Button onclick={newField}>
            <Icon name="plus" />
          </Button>
        </Container>
      </Container>
    {/if}
  {/if}
</Container>
