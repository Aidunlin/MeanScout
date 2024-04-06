<script lang="ts">
  import { type Expression, type ExpressionInput } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { flattenFields, type Field } from "$lib/field";

  export let expressions: Expression[];
  export let expressionIndex: number | undefined = undefined;
  export let inputs: ExpressionInput[];
  export let inputIndex: number | undefined = undefined;
  export let input: ExpressionInput = { from: "field", fieldIndex: 0 };
  export let fields: Field[];

  $: filteredExpressions = expressions.filter((_, i) => i !== expressionIndex);

  let dialog: Dialog;
  let error = "";

  function countPreviousFields(index: number) {
    return flattenFields(fields.slice(0, index)).length;
  }

  function onConfirm() {
    if (inputIndex == undefined) {
      inputs = [...inputs, structuredClone(input)];
    } else {
      inputs[inputIndex] = structuredClone(input);
    }
    dialog.close();
  }
</script>

<Dialog
  bind:this={dialog}
  {onConfirm}
  on:close={() => {
    if (inputIndex == undefined) {
      input = { from: "field", fieldIndex: 0 };
    } else {
      input = structuredClone(inputs[inputIndex]);
    }
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    {#if inputIndex == undefined}
      <Container maxWidth>
        <Icon name="plus" />
        New input
      </Container>
    {:else}
      <Icon name="pen" />
    {/if}
  </Button>

  <span>{inputIndex == undefined ? "New" : "Edit"} input</span>

  <Container direction="column" gap="none">
    From
    <select
      value={input.from}
      on:change={(e) => {
        switch (e.currentTarget.value) {
          case "field":
            input = { from: "field", fieldIndex: 0 };
            break;
          case "expression":
            input = { from: "expression", expressionName: "" };
            break;
        }
      }}
    >
      {#if fields.length}
        <option>field</option>
      {/if}
      {#if filteredExpressions.length}
        <option>expression</option>
      {/if}
    </select>
  </Container>
  {#if input.from == "field"}
    <Container direction="column" gap="none">
      Field
      <select bind:value={input.fieldIndex}>
        {#each fields as field, fieldIndex}
          {@const previousFields = countPreviousFields(fieldIndex)}
          {#if field.type == "group"}
            <optgroup label={field.name}>
              {#each field.fields as subField, innerFieldIndex}
                <option value={previousFields + innerFieldIndex}>{field.name} {subField.name}</option>
              {/each}
            </optgroup>
          {:else}
            <option value={previousFields}>{field.name}</option>
          {/if}
        {/each}
      </select>
    </Container>
  {:else}
    <Container direction="column" gap="none">
      Expression
      <select bind:value={input.expressionName}>
        {#each filteredExpressions as expression}
          <option>{expression.name}</option>
        {/each}
      </select>
    </Container>
  {/if}
</Dialog>
