<script lang="ts">
  import { type Entry, type MatchSurvey } from "$lib";
  import type { ExpressionAsExpressionInput } from "$lib/analysis";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import CalculateExpressionDialog from "$lib/dialogs/analysis/CalculateExpressionDialog.svelte";
  import CalculatePickListDialog from "$lib/dialogs/analysis/CalculatePickListDialog.svelte";
  import DeletePickListDialog from "$lib/dialogs/analysis/DeletePickListDialog.svelte";
  import ExpressionDialog from "$lib/dialogs/analysis/ExpressionDialog.svelte";
  import PickListDialog from "$lib/dialogs/analysis/PickListDialog.svelte";
  import { modeStore } from "$lib/settings";

  let {
    idb,
    surveyRecord,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<MatchSurvey>;
  } = $props();

  $effect(() => {
    idb.transaction("surveys", "readwrite").objectStore("surveys").put($state.snapshot(surveyRecord));
  });

  let calculatePickListDialog = $state<CalculatePickListDialog | undefined>(undefined);
  let pickListDialog = $state<PickListDialog | undefined>(undefined);

  let calculateExpressionDialog = $state<CalculateExpressionDialog | undefined>(undefined);
  let expressionDialog = $state<ExpressionDialog | undefined>(undefined);

  let preselectedExpressionNames = $state<string[]>([]);
  let isSelecting = $state(false);

  let usedExpressionNames = $derived([
    ...surveyRecord.expressions
      .flatMap((e) => e.inputs)
      .filter((input): input is ExpressionAsExpressionInput => input.from == "expression")
      .map((input) => input.expressionName),
    ...surveyRecord.pickLists.flatMap((p) => p.weights).map((w) => w.expressionName),
  ]);

  const entriesByTeam: Record<string, IDBRecord<Entry>[]> = {};

  const entriesRequest = idb.transaction("entries").objectStore("entries").index("surveyId").getAll(surveyRecord.id);
  entriesRequest.onsuccess = () => {
    const entries = entriesRequest.result;
    if (!entries) return;

    for (const entry of entries) {
      if (entry.status == "draft") {
        continue;
      }

      if (entry.team in entriesByTeam) {
        entriesByTeam[entry.team] = [...entriesByTeam[entry.team], entry];
      } else {
        entriesByTeam[entry.team] = [entry];
      }
    }
  };
</script>

<Header backLink="survey/{surveyRecord.id}" title="Analysis" iconName="chart-simple" />

{#if surveyRecord.expressions.length}
  <Container direction="column" padding="large">
    <h2>Pick Lists</h2>
    <CalculatePickListDialog
      bind:this={calculatePickListDialog}
      pickLists={surveyRecord.pickLists}
      {entriesByTeam}
      expressions={surveyRecord.expressions}
    />

    {#if $modeStore == "admin"}
      <PickListDialog
        bind:this={pickListDialog}
        expressions={surveyRecord.expressions}
        bind:pickLists={surveyRecord.pickLists}
        {preselectedExpressionNames}
      />
    {/if}
    <Container direction="column" gap="none">
      {#each surveyRecord.pickLists as pickList, pickListIndex}
        <Container direction="column" padding="large">
          <Button onclick={() => calculatePickListDialog?.open(pickListIndex)}>
            <Container gap="small" maxWidth>
              <Icon name="list-ol" />
              {pickList.name}
            </Container>
          </Button>
          {#if $modeStore == "admin"}
            <Container>
              <Button onclick={() => pickListDialog?.editPickList(pickListIndex)}>
                <Icon name="pen" />
                Edit
              </Button>
              <DeletePickListDialog bind:surveyRecord {pickListIndex} />
            </Container>
          {/if}
        </Container>
      {/each}
    </Container>
  </Container>
{:else}
  <Container padding="large">To set up pick lists, first create some expressions.</Container>
{/if}

<Container direction="column" padding="large">
  <h2>Expressions</h2>
  <CalculateExpressionDialog
    bind:this={calculateExpressionDialog}
    {entriesByTeam}
    expressions={surveyRecord.expressions}
  />

  {#if $modeStore == "admin"}
    <ExpressionDialog
      bind:this={expressionDialog}
      bind:expressions={surveyRecord.expressions}
      fields={surveyRecord.fields}
      bind:pickLists={surveyRecord.pickLists}
    />
    <Container>
      <Button
        onclick={() => {
          if (isSelecting) {
            preselectedExpressionNames = [];
            isSelecting = false;
          } else {
            isSelecting = true;
          }
        }}
      >
        <Icon name="list-check" />
        {#if isSelecting}
          Stop selecting
        {:else}
          Select
        {/if}
      </Button>
      {#if isSelecting}
        <Button
          onclick={() => {
            if (preselectedExpressionNames.length) {
              preselectedExpressionNames = [];
            } else {
              preselectedExpressionNames = surveyRecord.expressions.map((expression) => expression.name);
            }
          }}
        >
          <Container>
            {#if preselectedExpressionNames.length}
              <Icon name="xmark" />
              Deselect all
            {:else}
              <Icon name="check" />
              Select all
            {/if}
          </Container>
        </Button>
      {/if}
    </Container>
  {/if}

  <Container direction="column" gap="none">
    {#each surveyRecord.expressions as expression, expressionIndex}
      <Container direction="column" padding="large">
        {#if isSelecting}
          {@const isSelected = preselectedExpressionNames.includes(expression.name)}
          <Button
            onclick={() => {
              if (isSelected) {
                preselectedExpressionNames = preselectedExpressionNames.filter((name) => name != expression.name);
              } else {
                preselectedExpressionNames = [...preselectedExpressionNames, expression.name];
              }
            }}
          >
            <Container maxWidth gap="small">
              {#if isSelected}
                <Icon name="square-check" />
              {:else}
                <Icon style="regular" name="square" />
              {/if}
              {expression.name}
            </Container>
          </Button>
        {:else}
          <Button onclick={() => calculateExpressionDialog?.open(expressionIndex)}>
            <Container gap="small" maxWidth>
              <Icon name="percent" />
              {expression.name}
            </Container>
          </Button>
          {#if $modeStore == "admin"}
            <Container>
              <Button onclick={() => expressionDialog?.editExpression(expressionIndex)}>
                <Icon name="pen" />
                Edit
              </Button>
              {#if !usedExpressionNames.includes(expression.name)}
                <Button
                  onclick={() => (surveyRecord.expressions = surveyRecord.expressions.toSpliced(expressionIndex, 1))}
                >
                  <Icon name="trash" />
                  Delete
                </Button>
              {/if}
            </Container>
          {/if}
        {/if}
      </Container>
    {/each}
  </Container>
</Container>
