<script lang="ts">
  import { fieldTypes, type Field } from "$lib";
  import Button from "./Button.svelte";
  import Container from "./Container.svelte";
  import Icon from "./Icon.svelte";

  export let fields: Field[];
  export let field: Field;
  export let fieldIndex: number;
  export let disabled = false;

  export let onChange: (() => void) | undefined = undefined;

  function moveField(by: number) {
    fields.splice(fieldIndex + by, 0, ...fields.splice(fieldIndex, 1));
    fields = fields;
    onChange && onChange();
  }

  function switchFieldType(to: string) {
    switch (to) {
      case "team":
      case "match":
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
    onChange && onChange();
  }

  function duplicateField() {
    fields.splice(fieldIndex, 0, structuredClone(fields[fieldIndex]));
    fields = fields;
    onChange && onChange();
  }

  function deleteField() {
    fields = fields.filter((_, i) => i != fieldIndex);
    onChange && onChange();
  }

  function toggleAllowNegative() {
    if (field.type == "number") {
      field.allowNegative = !field.allowNegative;
      onChange && onChange();
    }
  }

  function deleteSelectValue(index: number) {
    if (field.type == "select") {
      field.values = field.values.filter((_, i) => i != index);
      onChange && onChange();
    }
  }

  function newSelectValue() {
    if (field.type == "select") {
      field.values = [...field.values, ""];
      onChange && onChange();
    }
  }

  function toggleLong() {
    if (field.type == "text") {
      field.long = !field.long;
      onChange && onChange();
    }
  }

  function newField() {
    if (field.type == "group") {
      field.fields = [...field.fields, { name: "", type: "toggle" }];
      onChange && onChange();
    }
  }
</script>

<Container direction="column" padding="large">
  <Container>
    <Container direction="column" gap="none">
      Name
      <input bind:value={field.name} on:change={onChange} {disabled} />
    </Container>
    <Container direction="column" gap="none">
      Type
      <select value={field.type} on:change={(e) => switchFieldType(e.currentTarget.value)} {disabled}>
        {#each fieldTypes as fieldType}
          <option>{fieldType}</option>
        {/each}
      </select>
    </Container>
  </Container>

  <Container spaceBetween>
    <Container>
      <Button title="Move up" disabled={fieldIndex == 0 || disabled} on:click={() => moveField(-1)}>
        <Icon name="arrow-up" />
      </Button>
      <Button title="Move down" disabled={fieldIndex == fields.length - 1 || disabled} on:click={() => moveField(1)}>
        <Icon name="arrow-down" />
      </Button>
      <Button title="Duplicate field" {disabled} on:click={duplicateField}>
        <Icon name="clone" />
      </Button>
    </Container>
    <Button title="Delete field" {disabled} on:click={deleteField}>
      <Icon name="trash" />
    </Button>
  </Container>

  {#if !disabled}
    {#if field.type == "number"}
      <Container direction="column" padding="large" maxWidth>
        <Container>
          <Button on:click={toggleAllowNegative}>
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
        <Container direction="column" padding="large">
          {#each field.values as value, i}
            <Container>
              <input bind:value on:change={onChange} style="width:200px" />
              <Button title="Delete value" on:click={() => deleteSelectValue(i)}>
                <Icon name="trash" />
              </Button>
            </Container>
          {/each}
        </Container>
        <Container>
          <Button title="New value" on:click={newSelectValue}>
            <Icon name="plus" />
          </Button>
        </Container>
      </Container>
    {:else if field.type == "text"}
      <Container direction="column" padding="large" maxWidth>
        <Container align="end">
          <Container direction="column" gap="none">
            Tip
            <input bind:value={field.tip} on:change={onChange} />
          </Container>
          <Button on:click={toggleLong}>
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
          <svelte:self bind:fields={field.fields} bind:field={innerField} {onChange} fieldIndex={innerFieldIndex} />
        {/each}
        <Container>
          <Button title="New field" on:click={newField}>
            <Icon name="plus" />
          </Button>
        </Container>
      </Container>
    {/if}
  {/if}
</Container>
