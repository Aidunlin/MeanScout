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

  let dialog: Dialog;
  let error = "";

  function onConfirm() {
    if (pickListIndex == undefined) {
      pickLists = [...pickLists, pickList];
    } else {
      pickLists[pickListIndex] = pickList;
    }
    dialog.close();
  }
</script>

<Dialog
  bind:this={dialog}
  {onConfirm}
  on:close={() => {
    if (pickListIndex == undefined) {
      pickList = { name: "New pick list", weights: [] };
    } else {
      pickList = pickLists[pickListIndex];
    }
    error = "";
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

  <span>Weights</span>
  {#each pickList.weights as weight, weightIndex}
    <Container align="end">
      <Button on:click={() => (pickList.weights = pickList.weights.toSpliced(weightIndex, 1))}>
        <Icon name="trash" />
      </Button>
      <Container direction="column" gap="none">
        Expression
        <select bind:value={weight.expressionName}>
          {#each expressions as expression}
            <option>{expression.name}</option>
          {/each}
        </select>
      </Container>
      <Container direction="column" gap="none">
        Percentage
        <input type="number" min="-100" max="100" step="1" bind:value={weight.percentage} />
      </Container>
    </Container>
  {/each}

  <Button on:click={() => (pickList.weights = [...pickList.weights, { expressionName: "", percentage: 0 }])}>
    <Container maxWidth>
      <Icon name="plus" />
      New weight
    </Container>
  </Button>

  {#if error}
    <span>Error: {error}</span>
  {/if}
</Dialog>
