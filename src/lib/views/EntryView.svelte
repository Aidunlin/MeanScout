<script lang="ts">
  import { SurveyStore, flattenConfigs, getHighestMatchValue, getMetricDefaultValue, type Survey } from "$lib/app";
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
    const configs = flattenConfigs(survey.configs);

    survey.entries[entryId].values.forEach((value, i) => {
      switch (configs[i].type) {
        case "team":
          if (!/^\d{1,4}[A-Z]?$/.test(value)) {
            error = `Invalid value for ${configs[i].name}`;
          }
          if (survey.teams.length && !survey.teams.includes(value)) {
            error = `Invalid value for ${configs[i].name} (team not allowlisted)`;
          }
          break;
        case "match":
          if (!/\d{1,3}/.test(`${value}`)) {
            error = `Invalid value for ${configs[i].name}`;
          }
          break;
      }

      if (value == undefined || typeof value !== typeof getMetricDefaultValue(configs[i])) {
        error = `Invalid value for ${configs[i].name}`;
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

    const configs = flattenConfigs(survey.configs);

    const newEntry = {
      values: configs.map((config) => {
        switch (config.type) {
          case "match":
            return getHighestMatchValue(survey) + 1;
          default:
            return getMetricDefaultValue(config);
        }
      }),
      created: new Date(),
      modified: new Date(),
    };

    survey.entries = [newEntry, ...survey.entries];
  }

  function countPreviousConfigs(index: number) {
    return flattenConfigs(survey.configs.slice(0, index)).length;
  }
</script>

<Header title="Entry ({survey.name})" backLink={`/survey/${survey.id}/entries`} />

<datalist id="teams-list">
  {#each survey.teams as team}
    <option value={team} />
  {/each}
</datalist>

<Container padding alignEnd>
  {#each survey.configs as config, i (config)}
    {#if config.type == "group"}
      <h2>{config.name}</h2>
      {#each config.configs as innerConfig, innerConfigIndex (innerConfig)}
        <MetricEditor
          config={innerConfig}
          bind:value={survey.entries[entryId].values[innerConfigIndex + countPreviousConfigs(i)]}
        />
      {/each}
      <div style="width: 100%" />
    {:else}
      <MetricEditor {config} bind:value={survey.entries[entryId].values[countPreviousConfigs(i)]} />
    {/if}
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
</footer>
