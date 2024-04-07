<script lang="ts">
  import { parseValueFromString } from "$lib";
  import {
    mapExpressionTypes,
    reduceExpressionTypes,
    type Expression,
    type ExpressionAsExpressionInput,
    type FieldAsExpressionInput,
    type PickList,
  } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { flattenFields, getDetailedFieldName, type Field } from "$lib/field";

  export let expressions: Expression[];
  export let expressionIndex: number | undefined = undefined;
  export let expression: Expression = { name: "", type: "average", inputs: [] };
  export let fields: Field[];
  export let pickLists: PickList[];

  const flattenedFields = flattenFields(fields);

  let sortedExpressions: Expression[] = [];
  let sortedFields: {
    field: (typeof flattenedFields)[number];
    index: number;
  }[] = [];
  let dialog: Dialog;
  let error = "";

  function onOpen() {
    sortedExpressions = expressions
      .filter((exp) => exp.name != expression.name)
      .toSorted((a, b) => {
        if (expressionIndex === undefined) return 0;
        const inputExpressionNames = expressions[expressionIndex].inputs
          .filter((input): input is ExpressionAsExpressionInput => input.from == "expression")
          .map((input) => input.expressionName);
        const includesA = inputExpressionNames.includes(a.name);
        const includesB = inputExpressionNames.includes(b.name);
        return Number(includesB) - Number(includesA);
      });

    sortedFields = flattenedFields
      .map((field, index) => ({ field, index }))
      .toSorted((a, b) => {
        if (expressionIndex === undefined) return 0;
        const inputFieldIndexes = expressions[expressionIndex].inputs
          .filter((input): input is FieldAsExpressionInput => input.from == "field")
          .map((input) => input.fieldIndex);
        const includesA = inputFieldIndexes.includes(a.index);
        const includesB = inputFieldIndexes.includes(b.index);
        return Number(includesB) - Number(includesA);
      });
  }

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

    if (expression.type == "divide" && expression.divisor == 0) {
      error = "divisor can't be 0!";
      return;
    }

    if (expression.type == "convert") {
      expression.converters = expression.converters.map(({ from, to }) => ({
        from: parseValueFromString(from),
        to: parseValueFromString(to),
      }));
      expression.defaultTo = parseValueFromString(expression.defaultTo);
    }

    if (expressionIndex == undefined) {
      expressions = [...expressions, structuredClone(expression)];
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
        pickLists = pickLists.map((pickList) => {
          pickList.weights = pickList.weights.map(weight => {
            if (weight.expressionName == prevName) {
              weight.expressionName = expression.name;
            }
            return weight;
          });
          return pickList;
        });
      }
      expressions[expressionIndex] = structuredClone(expression);
    }
    dialog.close();
  }
</script>

<Dialog
  bind:this={dialog}
  {onOpen}
  {onConfirm}
  on:close={() => {
    if (expressionIndex == undefined) {
      expression = { name: "", type: "average", inputs: [] };
    } else {
      expression = structuredClone(expressions[expressionIndex]);
    }
    error = "";
    sortedExpressions = [];
    sortedFields = [];
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
          case "divide":
            expression = {
              name: expression.name,
              type: e.currentTarget.value,
              inputs: expression.inputs,
              divisor: 1,
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
      <Container align="end">
        <Button
          on:click={() => {
            if (expression.type == "convert") {
              expression.converters = expression.converters.toSpliced(converterIndex, 1);
            }
          }}
        >
          <Icon name="trash" />
        </Button>
        <Container gap="none" align="end">
          <Container direction="column" gap="none">
            From
            <input class="converter" bind:value={converter.from} />
          </Container>
          <Container padding="small">
            <Icon name="arrow-right" />
          </Container>
          <Container direction="column" gap="none">
            To
            <input class="converter" bind:value={converter.to} />
          </Container>
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
      <Container maxWidth>
        <Icon name="plus" />
        New converter
      </Container>
    </Button>
    <Container direction="column" gap="none">
      Default to
      <input bind:value={expression.defaultTo} placeholder="Leave blank to keep input" />
    </Container>
  {:else if expression.type == "multiply"}
    <Container direction="column" gap="none">
      Multiplier
      <input type="number" bind:value={expression.multiplier} />
    </Container>
  {:else if expression.type == "divide"}
    <Container direction="column" gap="none">
      Divisor
      <input type="number" bind:value={expression.divisor} />
    </Container>
  {/if}

  <span>Inputs</span>

  <div class="dialog-overflow">
    <details open>
      <summary>Expressions</summary>
      <Container direction="column" padding="small" gap="small">
        {#each sortedExpressions as sortedExpression}
          {@const inputIndex = expression.inputs.findIndex(
            (input) => input.from == "expression" && input.expressionName == sortedExpression.name,
          )}
          {@const isInput = inputIndex != -1}

          <Button
            on:click={() => {
              if (isInput) {
                expression.inputs = expression.inputs.toSpliced(inputIndex, 1);
              } else {
                expression.inputs = [
                  ...expression.inputs,
                  { from: "expression", expressionName: sortedExpression.name },
                ];
              }
            }}
          >
            <Container maxWidth>
              {#if isInput}
                <Icon name="square-check" />
              {:else}
                <Icon style="regular" name="square" />
              {/if}
              {sortedExpression.name}
            </Container>
          </Button>
        {/each}
      </Container>
    </details>

    <details open>
      <summary>Fields</summary>
      <Container direction="column" padding="small" gap="small">
        {#each sortedFields as sortedField}
          {@const inputIndex = expression.inputs.findIndex(
            (input) => input.from == "field" && input.fieldIndex == sortedField.index,
          )}
          {@const isInput = inputIndex != -1}

          <Button
            on:click={() => {
              if (isInput) {
                expression.inputs = expression.inputs.toSpliced(inputIndex, 1);
              } else {
                expression.inputs = [...expression.inputs, { from: "field", fieldIndex: sortedField.index }];
              }
            }}
          >
            <Container maxWidth>
              {#if isInput}
                <Icon name="square-check" />
              {:else}
                <Icon style="regular" name="square" />
              {/if}
              {getDetailedFieldName(fields, sortedField.index)}
            </Container>
          </Button>
        {/each}
      </Container>
    </details>
  </div>

  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>

<style>
  .converter {
    width: 150px;
  }

  summary {
    background: var(--fg-color);
    cursor: default;
    padding: var(--inner-gap);
    padding-left: var(--outer-gap);
  }

  summary:hover,
  summary:focus {
    outline: var(--outline);
  }

  summary::marker {
    color: var(--theme-color);
  }
</style>
