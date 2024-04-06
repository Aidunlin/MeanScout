<script lang="ts">
  import { type Entry, type MatchSurvey } from "$lib";
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

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<MatchSurvey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  $: usedExpressions = [
    ...new Set([
      ...surveyRecord.expressions
        .flatMap((e) => e.inputs)
        .filter((input): input is { from: "expression"; expressionName: string } => input.from == "expression")
        .map((input) => input.expressionName),
      ...surveyRecord.pickLists.flatMap((p) => p.weights).map((w) => w.expressionName),
    ]),
  ];

  const entriesByTeam: Record<string, IDBRecord<Entry>[]> = {};
  const entriesCursorRequest = idb
    .transaction("entries")
    .objectStore("entries")
    .index("surveyId")
    .openCursor(surveyRecord.id);
  entriesCursorRequest.onsuccess = () => {
    const cursor = entriesCursorRequest.result;
    if (!cursor) return;
    if (cursor.value.status != "draft") {
      if (cursor.value.team in entriesByTeam) {
        entriesByTeam[cursor.value.team] = [...entriesByTeam[cursor.value.team], cursor.value];
      } else {
        entriesByTeam[cursor.value.team] = [cursor.value];
      }
    }
    cursor.continue();
  };
</script>

<Header backLink="survey/{surveyRecord.id}" title="Analysis" iconName="chart-simple" />

{#if surveyRecord.expressions.length}
  <Container direction="column" padding="large">
    <h2>Pick Lists</h2>
    {#if $modeStore == "admin"}
      <PickListDialog expressions={surveyRecord.expressions} bind:pickLists={surveyRecord.pickLists} />
    {/if}

    <Container direction="column" gap="none">
      {#each surveyRecord.pickLists as pickList, pickListIndex}
        <Container direction="column" padding="large">
          <CalculatePickListDialog {entriesByTeam} expressions={surveyRecord.expressions} {pickList} />
          {#if $modeStore == "admin"}
            <Container spaceBetween>
              <PickListDialog
                expressions={surveyRecord.expressions}
                bind:pickLists={surveyRecord.pickLists}
                {pickListIndex}
                pickList={structuredClone(pickList)}
              />
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
  {#if $modeStore == "admin"}
    <ExpressionDialog bind:expressions={surveyRecord.expressions} fields={surveyRecord.fields} />
  {/if}

  <Container direction="column" gap="none">
    {#each surveyRecord.expressions as expression, expressionIndex}
      {@const used = usedExpressions.includes(expression.name)}
      <Container direction="column" padding="large">
        <CalculateExpressionDialog {entriesByTeam} expressions={surveyRecord.expressions} {expression} />
        {#if $modeStore == "admin"}
          <Container spaceBetween>
            <ExpressionDialog
              bind:expressions={surveyRecord.expressions}
              {expressionIndex}
              expression={structuredClone(expression)}
              fields={surveyRecord.fields}
            />
            {#if !used}
              <Button
                on:click={() => (surveyRecord.expressions = surveyRecord.expressions.toSpliced(expressionIndex, 1))}
              >
                <Icon name="trash" />
                Delete
              </Button>
            {/if}
          </Container>
        {/if}
      </Container>
    {/each}
  </Container>
</Container>
