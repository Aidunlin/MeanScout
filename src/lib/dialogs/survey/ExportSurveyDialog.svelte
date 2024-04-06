<script lang="ts">
  import { download, shareAsFile, shareAsText, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let surveyRecord: IDBRecord<Survey>;

  const cleanedSurveyName = surveyRecord.name.replaceAll(" ", "_");

  function surveyAsJSON() {
    const survey = structuredClone(surveyRecord) as Survey & { id?: number };
    delete survey.id;
    return JSON.stringify(survey, undefined, "  ");
  }

  function downloadSurvey() {
    download(surveyAsJSON(), `${cleanedSurveyName}-survey.json`, "application/json");
  }

  function shareSurveyAsFile() {
    // Web Share API does not allow JSON files.
    // https://docs.google.com/document/d/1tKPkHA5nnJtmh2TgqWmGSREUzXgMUFDL6yMdVZHqUsg
    shareAsFile(surveyAsJSON(), `${cleanedSurveyName}-survey.txt`, "text/plain");
  }

  function shareSurveyAsText() {
    shareAsText(surveyAsJSON(), `${cleanedSurveyName}-survey`);
  }
</script>

<Dialog>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="share-from-square" />
      Export survey
    </Container>
  </Button>

  <span>Export survey</span>
  {#if "canShare" in navigator}
    <Button on:click={shareSurveyAsFile}>
      <Container maxWidth>
        <Icon name="share-from-square" />
        Share as file
      </Container>
    </Button>
    <Button on:click={shareSurveyAsText}>
      <Container maxWidth>
        <Icon name="share" />
        Share as text snippet
      </Container>
    </Button>
  {/if}
  <Button on:click={downloadSurvey}>
    <Container maxWidth>
      <Icon name="file-code" />
      Download as file
    </Container>
  </Button>
</Dialog>
