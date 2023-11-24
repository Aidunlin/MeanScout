<script lang="ts">
  import { fieldTypes, type Field } from "$lib";
  import Button from "./Button.svelte";
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

<Container column padding>
  <Container>
    <Container column noGap>
      Name
      <input bind:value={field.name} {disabled} />
    </Container>
    <Container column noGap>
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
      <Container column maxWidth padding>
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
      <Container column maxWidth padding>
        {field.name} Values
        <Container column padding>
          {#each field.values as value, i}
            <Container>
              <input bind:value style="width:200px" />
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
      <Container column maxWidth padding>
        <Container alignEnd>
          <Container column noGap>
            Tip
            <input bind:value={field.tip} />
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
      <Container column maxWidth padding>
        {field.name} Fields
        {#each field.fields as innerField, innerFieldIndex (innerField)}
          <svelte:self bind:fields={field.fields} bind:field={innerField} fieldIndex={innerFieldIndex} />
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
