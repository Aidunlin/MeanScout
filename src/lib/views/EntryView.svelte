<script lang="ts">
  import { SurveyStore, getHighestMatchValue, getMetricDefaultValue, type Survey } from "$lib/app";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";
  import MetricEditor from "$lib/components/MetricEditor.svelte";

  export let surveyStore: SurveyStore;
  export let survey: Survey;
  export let entryId: number;

  $: surveyStore.put(survey);

  let saveEntryDialog = { error: "" };

  function validateEntry() {
    let error = "";
    survey.entries[entryId].values.forEach((value, i) => {
      switch (survey.configs[i].type) {
        case "team":
          if (!/^\d{1,4}[A-Z]?$/.test(value)) {
            error = `Invalid value for ${survey.configs[i].name}`;
          }
          if (survey.teams.length && !survey.teams.includes(value)) {
            error = `Invalid value for ${survey.configs[i].name} (team not allowlisted)`;
          }
          break;
        case "match":
          if (!/\d{1,3}/.test(`${value}`)) {
            error = `Invalid value for ${survey.configs[i].name}`;
          }
          break;
        case "text":
          if (survey.configs[i].required && !value.trim()) {
            error = `Invalid value for ${survey.configs[i].name}`;
          }
          break;
      }
      if (value == undefined || typeof value !== typeof getMetricDefaultValue(survey.configs[i])) {
        error = `Invalid value for ${survey.configs[i].name}`;
      }
    });
    return error;
  }

  function saveAndStartNewEntry() {
    const error = validateEntry();
    if (error) {
      saveEntryDialog.error = `Could not save entry! ${error}`;
      return false;
    }
    const newEntry = {
      values: survey.configs.map((config) => {
        if (config.type == "match") {
          return getHighestMatchValue(survey) + 1;
        }
        return getMetricDefaultValue(config);
      }),
      created: new Date(),
      modified: new Date(),
    };
    survey.entries = [newEntry, ...survey.entries];
  }

  function resetEntry() {
    for (let i = 0; i < survey.entries[entryId].values.length; i++) {
      if (!["team", "match"].includes(survey.configs[i].type)) {
        survey.entries[entryId].values[i] = getMetricDefaultValue(survey.configs[i]);
      }
    }
  }
</script>

<Header title="Entry ({survey.name})" backLink={`/survey/${survey.id}/entries`} />

<datalist id="teams-list">
  {#each survey.teams as team}
    <option value={team} />
  {/each}
</datalist>

<Container padding alignEnd>
  {#each survey.configs as config, i}
    <MetricEditor {config} bind:value={survey.entries[entryId].values[i]} />
  {/each}
</Container>

<footer>
  <Dialog
    openButton={{ iconName: "floppy-disk", title: "Save entry" }}
    onConfirm={saveAndStartNewEntry}
    on:close={() => (saveEntryDialog = { error: "" })}
  >
    <span>Save this entry and start a new one?</span>
    {#if saveEntryDialog.error}
      <span>{saveEntryDialog.error}</span>
    {/if}
  </Dialog>

  <Dialog openButton={{ iconName: "arrow-rotate-left", title: "Reset entry" }} onConfirm={resetEntry}>
    <span>Reset this entry?</span>
  </Dialog>
</footer>
