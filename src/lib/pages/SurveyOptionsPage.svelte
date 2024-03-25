<script lang="ts">
  import { download, share, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import DeleteSurveyDialog from "$lib/dialogs/DeleteSurveyDialog.svelte";
  import EditSurveyNameDialog from "$lib/dialogs/EditSurveyNameDialog.svelte";
  import EditSurveyTbaEventKeyDialog from "$lib/dialogs/EditSurveyTbaEventKeyDialog.svelte";
  import { modeStore, tbaAuthKeyStore } from "$lib/settings";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);

  function surveyAsJSON() {
    const survey = structuredClone(surveyRecord) as Survey & { id?: number };
    delete survey.id;
    return JSON.stringify(survey, undefined, "  ");
  }

  function downloadSurvey() {
    download(surveyAsJSON(), `${surveyRecord.name}-survey.json`, "application/json");
  }

  function shareSurvey() {
    // Web Share API does not allow JSON files.
    // https://docs.google.com/document/d/1tKPkHA5nnJtmh2TgqWmGSREUzXgMUFDL6yMdVZHqUsg
    share(surveyAsJSON(), `${surveyRecord.name}-survey.txt`, "text/plain");
  }
</script>

<Header backLink="survey/{surveyRecord.id}" title="Options" iconName="gears" />

<Container direction="column" padding="large">
  <h2>Export</h2>
  <Button title="Download survey" on:click={downloadSurvey}>
    <Container maxWidth>
      <Icon name="download" />
      Download survey
    </Container>
  </Button>
  {#if "canShare" in navigator}
    <Button title="Share survey" on:click={shareSurvey}>
      <Container maxWidth>
        <Icon name="share-from-square" />
        Share survey
      </Container>
    </Button>
  {/if}

  {#if $modeStore == "admin"}
    <h2>Options</h2>
    <EditSurveyNameDialog bind:surveyRecord />

    {#if $tbaAuthKeyStore}
      <h2>The Blue Alliance</h2>
      <EditSurveyTbaEventKeyDialog bind:surveyRecord />
    {/if}

    <h2>Danger Zone</h2>
    <DeleteSurveyDialog {idb} {surveyRecord} />
  {/if}
</Container>
