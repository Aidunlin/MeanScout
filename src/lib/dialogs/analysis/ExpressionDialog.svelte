<script lang="ts">
  import { parseValueFromString } from "$lib";
  import { mapExpressionTypes, reduceExpressionTypes, type Expression, type PickList } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import ExpressionConvertersDialog from "$lib/dialogs/analysis/ExpressionConvertersDialog.svelte";
  import { flattenFields, getDetailedFieldName, type Field } from "$lib/field";

  export let expressions: Expression[];
  export let fields: Field[];
  export let pickLists: PickList[];
  export let preselectedExpressionNames: string[] | undefined = undefined;

  const flattenedFields = flattenFields(fields);

  let dialog: Dialog;
  let expressionIndex: number | undefined = undefined;
  let expression: Expression = { name: "", type: "average", inputs: [] };
  let error = "";

  export function newExpression() {
    expressionIndex = undefined;
    expression = { name: "", type: "average", inputs: [] };

    if (preselectedExpressionNames?.length) {
      expression.inputs = preselectedExpressionNames.map((expressionName) => ({
        from: "expression",
        expressionName,
      }));
    }

    dialog.open();
  }

  export function editExpression(index: number) {
    expressionIndex = index;
    expression = structuredClone(expressions[expressionIndex]);
    dialog.open();
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
          pickList.weights = pickList.weights.map((weight) => {
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

  function onClose() {
    if (expressionIndex == undefined) {
      expression = { name: "", type: "average", inputs: [] };
    } else {
      expression = structuredClone(expressions[expressionIndex]);
    }
    error = "";
  }
</script>

<Dialog bind:this={dialog} {onConfirm} on:close={onClose}>
  <Button slot="opener" on:click={newExpression}>
    <Container maxWidth>
      <Icon name="plus" />
      New expression
      {#if preselectedExpressionNames?.length}
        using selected expressions ({preselectedExpressionNames.length})
      {/if}
    </Container>
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
    <ExpressionConvertersDialog
      bind:expression
      converters={structuredClone(expression.converters)}
      defaultTo={structuredClone(expression.defaultTo)}
    />
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
        {#each expressions as exp}
          {@const inputIndex = expression.inputs.findIndex(
            (input) => input.from == "expression" && input.expressionName == exp.name,
          )}
          {@const isInput = inputIndex != -1}

          <Button
            on:click={() => {
              if (isInput) {
                expression.inputs = expression.inputs.toSpliced(inputIndex, 1);
              } else {
                expression.inputs = [...expression.inputs, { from: "expression", expressionName: exp.name }];
              }
            }}
          >
            <Container maxWidth>
              {#if isInput}
                <Icon name="square-check" />
              {:else}
                <Icon style="regular" name="square" />
              {/if}
              {exp.name}
            </Container>
          </Button>
        {/each}
      </Container>
    </details>

    <details open>
      <summary>Fields</summary>
      <Container direction="column" padding="small" gap="small">
        {#each flattenedFields as _, fieldIndex}
          {@const inputIndex = expression.inputs.findIndex(
            (input) => input.from == "field" && input.fieldIndex == fieldIndex,
          )}
          {@const isInput = inputIndex != -1}

          <Button
            on:click={() => {
              if (isInput) {
                expression.inputs = expression.inputs.toSpliced(inputIndex, 1);
              } else {
                expression.inputs = [...expression.inputs, { from: "field", fieldIndex }];
              }
            }}
          >
            <Container maxWidth>
              {#if isInput}
                <Icon name="square-check" />
              {:else}
                <Icon style="regular" name="square" />
              {/if}
              {getDetailedFieldName(fields, fieldIndex)}
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
