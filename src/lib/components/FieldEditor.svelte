<script lang="ts">
  import { fieldTypes, type Field } from "$lib";
  import Container from "./Container.svelte";
  import Icon from "./Icon.svelte";

  export let fields: Field[];
  export let field: Field;
  export let fieldIndex: number;
  export let disabled = false;

  function moveField(by: number) {
    fields.splice(fieldIndex + by, 0, ...fields.splice(fieldIndex, 1));
    fields = fields;
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
  }

  function duplicateField() {
    fields.splice(fieldIndex, 0, structuredClone(fields[fieldIndex]));
    fields = fields;
  }

  function deleteField() {
    fields = fields.filter((_, i) => i != fieldIndex);
  }

  function toggleAllowNegative() {
    if (field.type == "number") {
      field.allowNegative = !field.allowNegative;
    }
  }

  function deleteSelectValue(index: number) {
    if (field.type == "select") {
      field.values = field.values.filter((_, i) => i != index);
    }
  }

  function newSelectValue() {
    if (field.type == "select") {
      field.values = [...field.values, ""];
    }
  }

  function toggleLong() {
    if (field.type == "text") {
      field.long = !field.long;
    }
  }

  function newField() {
    if (field.type == "group") {
      field.fields = [...field.fields, { name: "", type: "toggle" }];
    }
  }
</script>

<Container direction="column" padding="large">
  <Container>
    <Container direction="column" gap="none">
      Name
      <input bind:value={field.name} {disabled} />
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
      <Container type="button" onClick={() => moveField(-1)} title="Move up" disabled={fieldIndex == 0 || disabled}>
        <Icon name="arrow-up" />
      </Container>
      <Container type="button" onClick={() => moveField(1)} title="Move down" disabled={fieldIndex == fields.length - 1 || disabled}>
        <Icon name="arrow-down" />
      </Container>
      <Container type="button" onClick={duplicateField} title="Duplicate field" {disabled}>
        <Icon name="clone" />
      </Container>
    </Container>
    <Container type="button" onClick={deleteField} title="Delete field" {disabled}>
      <Icon name="trash" />
    </Container>
  </Container>

  {#if !disabled}
    {#if field.type == "number"}
      <Container direction="column" padding="large" maxWidth>
        <Container>
          <Container type="button" onClick={toggleAllowNegative}>
            {#if field.allowNegative}
              <Icon name="square-check" />
            {:else}
              <Icon style="regular" name="square" />
            {/if}
            Allow negative
          </Container>
        </Container>
      </Container>
    {:else if field.type == "select"}
      <Container direction="column" padding="large">
        {field.name} Values
        <Container direction="column" padding="large">
          {#each field.values as value, i}
            <Container>
              <input bind:value style="width:200px" />
              <Container type="button" onClick={() => deleteSelectValue(i)} title="Delete value">
                <Icon name="trash" />
              </Container>
            </Container>
          {/each}
        </Container>
        <Container>
          <Container type="button" onClick={newSelectValue} title="New value">
            <Icon name="plus" />
          </Container>
        </Container>
      </Container>
    {:else if field.type == "text"}
      <Container direction="column" padding="large">
        <Container align="end">
          <Container direction="column" gap="none">
            Tip
            <input bind:value={field.tip} />
          </Container>
          <Container type="button" onClick={toggleLong}>
            {#if field.long}
              <Icon name="square-check" />
            {:else}
              <Icon style="regular" name="square" />
            {/if}
            Long
          </Container>
        </Container>
      </Container>
    {:else if field.type == "group"}
      <Container direction="column" padding="large">
        {field.name} Fields
        {#each field.fields as innerField, innerFieldIndex (innerField)}
          <svelte:self bind:fields={field.fields} bind:field={innerField} fieldIndex={innerFieldIndex} />
        {/each}
        <Container>
          <Container type="button" onClick={newField} title="New field">
            <Icon name="plus" />
          </Container>
        </Container>
      </Container>
    {/if}
  {/if}
</Container>
