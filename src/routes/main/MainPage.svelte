<script lang="ts">
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { modeStore } from "$lib/settings";
  import type { Survey } from "$lib/survey";
  import ImportSurveyDialog from "./ImportSurveyDialog.svelte";
  import NewSurveyDialog from "./NewSurveyDialog.svelte";

  let {
    idb,
  }: {
    idb: IDBDatabase;
  } = $props();

  let surveyRecords = $state<IDBRecord<Survey>[]>([]);

  const surveysRequest = idb.transaction("surveys").objectStore("surveys").getAll();
  surveysRequest.onsuccess = () => {
    surveyRecords = surveysRequest.result ?? [];
  };
</script>

<Header />

{#if surveyRecords.length}
  <Container direction="column" padding="large">
    <h2>Surveys</h2>
    {#each surveyRecords.toSorted((a, b) => b.modified.getTime() - a.modified.getTime()) as survey (survey.id)}
      <Anchor route="survey/{survey.id}">
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
  {#if $modeStore == "admin"}
    <NewSurveyDialog {idb} />
    <ImportSurveyDialog {idb} />
  {/if}
  <Anchor route="settings">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="gears" />
        Settings
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
  <Anchor route="about">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="info-circle" />
        About
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
</Container>
