<script lang="ts">
  import { type IDBRecord, type Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import ImportSurveyDialog from "$lib/dialogs/ImportSurveyDialog.svelte";
  import NewSurveyDialog from "$lib/dialogs/NewSurveyDialog.svelte";

  export let idb: IDBDatabase;

  let surveyRecords: IDBRecord<Survey>[] = [];

  const cursorRequest = idb.transaction("surveys").objectStore("surveys").openCursor();
  cursorRequest.onsuccess = () => {
    const cursor = cursorRequest.result;
    if (cursor) {
      surveyRecords = [...surveyRecords, cursor.value];
      cursor.continue();
    }
  };
</script>

<Header />

{#if surveyRecords.length}
  <Container direction="column" padding="large">
    <h2>Surveys</h2>
    {#each surveyRecords.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as survey (survey.id)}
      <Anchor hash="survey/{survey.id}" title="Open survey">
        <Container maxWidth spaceBetween>
          <span>{survey.name}</span>
          <Icon name="arrow-right" />
        </Container>
      </Anchor>
    {/each}
  </Container>
{/if}

<Container direction="column" padding="large">
  <h2>Options</h2>
  <NewSurveyDialog {idb} />
  <ImportSurveyDialog {idb} />
  <Anchor hash="settings">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="gears" />
        Settings
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
</Container>
