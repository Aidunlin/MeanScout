<script lang="ts">
  import { type Expression, type PickList } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let expressions: Expression[];
  export let pickLists: PickList[];
  export let pickListIndex: number | undefined = undefined;
  export let pickList: PickList = { name: "New pick list", weights: [] };

  $: totalWeights = pickList.weights.reduce((total, weight) => total + Math.abs(weight.percentage), 0);

  let sortedExpressions: Expression[] = [];
  let dialog: Dialog;
  let error = "";

  function onOpen() {
    sortedExpressions = expressions.toSorted((a, b) => {
      if (pickListIndex === undefined) return 0;
      const weightExpressionNames = pickLists[pickListIndex].weights
        .filter((w) => w.percentage)
        .map((w) => w.expressionName);
      const includesA = weightExpressionNames.includes(a.name);
      const includesB = weightExpressionNames.includes(b.name);
      return Number(includesB) - Number(includesA);
    });
  }

  function onConfirm() {
    pickList.weights = pickList.weights.filter((weight) => weight.percentage);
    if (pickListIndex == undefined) {
      pickLists = [...pickLists, structuredClone(pickList)];
    } else {
      pickLists[pickListIndex] = structuredClone(pickList);
    }
    dialog.close();
  }
</script>

<Dialog
  bind:this={dialog}
  {onOpen}
  {onConfirm}
  on:close={() => {
    if (pickListIndex == undefined) {
      pickList = { name: "New pick list", weights: [] };
    } else {
      pickList = structuredClone(pickLists[pickListIndex]);
    }
    error = "";
    sortedExpressions = [];
  }}
>
  <Button slot="opener" let:open on:click={open}>
    {#if pickListIndex == undefined}
      <Container maxWidth>
        <Icon name="plus" />
        New pick list
      </Container>
    {:else}
      <Icon name="pen" />
      Edit
    {/if}
  </Button>

  <span>{pickListIndex == undefined ? "New" : "Edit"} pick list</span>

  <Container direction="column" gap="none">
    Name
    <input bind:value={pickList.name} />
  </Container>

  <span>Expressions</span>

  <div class="dialog-overflow">
    {#each sortedExpressions as sortedExpression}
      {@const weightIndex = pickList.weights.findIndex((weight) => weight.expressionName == sortedExpression.name)}
      {@const isWeight = weightIndex != -1}

      <Container direction="column" gap="small">
        <Button
          on:click={() => {
            if (isWeight) {
              pickList.weights = pickList.weights.toSpliced(weightIndex, 1);
            } else {
              pickList.weights = [...pickList.weights, { expressionName: sortedExpression.name, percentage: 0 }];
            }
          }}
        >
          <Container maxWidth>
            {#if isWeight}
              <Icon name="square-check" />
            {:else}
              <Icon style="regular" name="square" />
            {/if}
            {sortedExpression.name}
          </Container>
        </Button>
        {#if isWeight}
          <Container direction="column" gap="none">
            Weight
            <input type="number" min="-100" max="100" step="1" bind:value={pickList.weights[weightIndex].percentage} />
          </Container>
          <div style="margin-bottom: var(--outer-gap)"></div>
        {/if}
      </Container>
    {/each}
  </div>

  <span>Total weights: {totalWeights}%</span>

  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
