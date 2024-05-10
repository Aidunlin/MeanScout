<script lang="ts">
  import { type Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import DeleteSurveyDialog from "$lib/dialogs/survey/DeleteSurveyDialog.svelte";
  import EditSurveyNameDialog from "$lib/dialogs/survey/EditSurveyNameDialog.svelte";
  import EditSurveyTbaEventKeyDialog from "$lib/dialogs/survey/EditSurveyTbaEventKeyDialog.svelte";
  import ExportSurveyDialog from "$lib/dialogs/survey/ExportSurveyDialog.svelte";
  import { tbaAuthKeyStore } from "$lib/settings";

  let {
    idb,
    surveyRecord,
  }: {
    idb: IDBDatabase;
    surveyRecord: IDBRecord<Survey>;
  } = $props();

  $effect(() => {
    idb.transaction("surveys", "readwrite").objectStore("surveys").put($state.snapshot(surveyRecord));
  });
</script>

<Header backLink="survey/{surveyRecord.id}" title="Options" iconName="gears" />

<Container direction="column" padding="large">
  <h2>Options</h2>
  <ExportSurveyDialog {surveyRecord} />
  <EditSurveyNameDialog bind:surveyRecord />
  {#if $tbaAuthKeyStore}
    <EditSurveyTbaEventKeyDialog bind:surveyRecord />
  {/if}

  <h2>Danger Zone</h2>
  <DeleteSurveyDialog {idb} {surveyRecord} />
</Container>
