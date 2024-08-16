<script lang="ts">
  import type { Expression, PickList } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  let {
    expressions,
    pickLists = $bindable(),
    preselectedExpressionNames = undefined,
  }: {
    expressions: Expression[];
    pickLists: PickList[];
    preselectedExpressionNames?: string[] | undefined;
  } = $props();

  let dialog: Dialog;

  let error = $state("");
  let pickListIndex = $state<number | undefined>(undefined);
  let pickList = $state<PickList>({ name: "New pick list", weights: [] });

  let totalWeights = $derived(pickList.weights.reduce((total, weight) => total + Math.abs(weight.percentage), 0));

  export function newPickList() {
    pickListIndex = undefined;
    pickList = { name: "New pick list", weights: [] };

    if (preselectedExpressionNames?.length) {
      pickList.weights = preselectedExpressionNames.map((expressionName) => ({
        expressionName,
        percentage: (1 / (preselectedExpressionNames?.length ?? 1)) * 100,
      }));
    }

    dialog.open();
  }

  export function editPickList(index: number) {
    pickListIndex = index;
    pickList = structuredClone($state.snapshot(pickLists[pickListIndex]));
    dialog.open();
  }

  function onconfirm() {
    pickList.weights = pickList.weights.filter((weight) => weight.percentage);
    if (pickListIndex == undefined) {
      pickLists = [...pickLists, structuredClone($state.snapshot(pickList))];
    } else {
      pickLists[pickListIndex] = structuredClone($state.snapshot(pickList));
    }
    dialog.close();
  }

  function onclose() {
    if (pickListIndex == undefined) {
      pickList = { name: "New pick list", weights: [] };
    } else {
      pickList = structuredClone($state.snapshot(pickLists[pickListIndex]));
    }
    error = "";
  }
</script>

<Button onclick={newPickList}>
  <Container maxWidth>
    <Icon name="plus" />
    New pick list
    {#if preselectedExpressionNames?.length}
      using selected expressions ({preselectedExpressionNames.length})
    {/if}
  </Container>
</Button>

<Dialog bind:this={dialog} {onconfirm} {onclose}>
  <span>{pickListIndex == undefined ? "New" : "Edit"} pick list</span>

  <Container direction="column" gap="none">
    Name
    <input bind:value={pickList.name} />
  </Container>

  <span>Expressions</span>

  <div class="dialog-overflow">
    {#each expressions as expression}
      {@const weightIndex = pickList.weights.findIndex((weight) => weight.expressionName == expression.name)}
      {@const isWeight = weightIndex != -1}

      <Container direction="column" gap="small">
        <Button
          onclick={() => {
            if (isWeight) {
              pickList.weights = pickList.weights.toSpliced(weightIndex, 1);
            } else {
              pickList.weights = [...pickList.weights, { expressionName: expression.name, percentage: 0 }];
            }
          }}
        >
          <Container maxWidth>
            {#if isWeight}
              <Icon name="square-check" />
            {:else}
              <Icon style="regular" name="square" />
            {/if}
            {expression.name}
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
