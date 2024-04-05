<script lang="ts">
  import { mapExpressionTypes, reduceExpressionTypes, type Expression, generateExpressionName } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { getDetailedFieldName, type Field } from "$lib/field";
  import ExpressionInputDialog from "./ExpressionInputDialog.svelte";

  export let expressions: Expression[];
  export let expressionIndex: number | undefined = undefined;
  export let expression: Expression = { name: "", type: "average", inputs: [] };
  export let fields: Field[];

  let dialog: Dialog;
  let error = "";

  function onConfirm() {
    expression.name = expression.name.trim();

    if (!expression.name) {
      error = "name can't be empty!";
      return;
    }

    if (expressions.find((e, i) => e.name == expression.name && i != expressionIndex)) {
      error = "name must be unique!";
      return;
    }

    if (expressionIndex == undefined) {
      expressions = [...expressions, expression];
    } else {
      const prevName = expressions[expressionIndex].name;
      if (expression.name != prevName) {
        expressions = expressions.map((e) => {
          e.inputs = e.inputs.map((i) => {
            if (i.from == "expression" && i.expressionName == prevName) {
              i.expressionName = expression.name;
            }
            return i;
          });
          return e;
        });
      }
      expressions[expressionIndex] = expression;
    }
    dialog.close();
  }
</script>

<Dialog
  bind:this={dialog}
  {onConfirm}
  on:close={() => {
    if (expressionIndex == undefined) {
      expression = { name: "", type: "average", inputs: [] };
    } else {
      expression = expressions[expressionIndex];
    }
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    {#if expressionIndex == undefined}
      <Container maxWidth>
        <Icon name="plus" />
        New expression
      </Container>
    {:else}
      <Icon name="pen" />
      Edit
    {/if}
  </Button>

  <span>{expressionIndex == undefined ? "New" : "Edit"} expression</span>

  <Container direction="column" gap="none">
    Name
    <input bind:value={expression.name} />
  </Container>

  <Container direction="column" gap="none">
    Type
    <select
      value={expression.type}
      on:change={(e) => {
        switch (e.currentTarget.value) {
          case "average":
          case "min":
          case "max":
          case "sum":
            expression = {
              name: expression.name,
              type: e.currentTarget.value,
              inputs: expression.inputs,
            };
            break;
          case "count":
            expression = {
              name: expression.name,
              type: e.currentTarget.value,
              inputs: expression.inputs,
              valueToCount: "",
            };
            break;
          case "convert":
            expression = {
              name: expression.name,
              type: e.currentTarget.value,
              inputs: expression.inputs,
              converters: [],
              defaultTo: "",
            };
            break;
          case "multiply":
            expression = {
              name: expression.name,
              type: e.currentTarget.value,
              inputs: expression.inputs,
              multiplier: 1,
            };
            break;
        }
      }}
    >
      <optgroup label="Reducers">
        {#each reduceExpressionTypes as expressionType}
          <option>{expressionType}</option>
        {/each}
      </optgroup>
      <optgroup label="Mappers">
        {#each mapExpressionTypes as expressionType}
          <option>{expressionType}</option>
        {/each}
      </optgroup>
    </select>
  </Container>

  {#if expression.type == "count"}
    <Container direction="column" gap="none">
      Value to count
      <input bind:value={expression.valueToCount} />
    </Container>
  {:else if expression.type == "convert"}
    Converters
    {#each expression.converters as converter, converterIndex}
      <Container padding="large">
        <Button
          on:click={() => {
            if (expression.type == "convert") {
              expression.converters = expression.converters.toSpliced(converterIndex, 1);
            }
          }}
        >
          <Icon name="trash" />
        </Button>
        <Container direction="column" gap="none">
          From
          <input bind:value={converter.from} />
        </Container>
        <Icon name="arrow-right" />
        <Container direction="column" gap="none">
          To
          <input bind:value={converter.to} />
        </Container>
      </Container>
    {/each}
    <Button
      on:click={() => {
        if (expression.type == "convert") {
          expression.converters = [...expression.converters, { from: "", to: "" }];
        }
      }}
    >
      <Icon name="plus" />
    </Button>
    <Container direction="column" gap="none">
      Default to
      <input bind:value={expression.defaultTo} />
    </Container>
  {:else if expression.type == "multiply"}
    <Container direction="column" gap="none">
      Multiplier
      <input type="number" bind:value={expression.multiplier} />
    </Container>
  {/if}

  Inputs
  {#each expression.inputs as input, inputIndex}
    <Container align="center">
      <ExpressionInputDialog
        {expressions}
        {expressionIndex}
        bind:inputs={expression.inputs}
        {inputIndex}
        input={structuredClone(input)}
        {fields}
      />
      <Container>
        <Button
          on:click={() => {
            expression.inputs = expression.inputs.toSpliced(inputIndex, 1);
          }}
        >
          <Icon name="trash" />
        </Button>
      </Container>
      {input.from == "expression" ? input.expressionName : getDetailedFieldName(fields, input.fieldIndex)}
    </Container>
  {/each}

  <ExpressionInputDialog {expressions} {expressionIndex} bind:inputs={expression.inputs} {fields} />

  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
