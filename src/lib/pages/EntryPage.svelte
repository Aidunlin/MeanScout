<script lang="ts">
  import { flattenConfigs, getHighestMatchValue, getMetricDefaultValue, type Entry, type Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";
  import MetricEditor from "$lib/components/MetricEditor.svelte";
  import type { EntryStore, IDBRecord } from "$lib/db";

  export let surveyRecord: IDBRecord<Survey>;
  export let entryStore: EntryStore;
  export let entryRecord: IDBRecord<Entry>;

  $: entryStore.put(entryRecord);

  let saveEntryDialog = { error: "" };

  function validateEntry() {
    let error = "";
    const configs = flattenConfigs(surveyRecord.configs);

    entryRecord.values.forEach((value, i) => {
      switch (configs[i].type) {
        case "team":
          if (!/^\d{1,4}[A-Z]?$/.test(value)) {
            error = `Invalid value for ${configs[i].name}`;
          }
          if (surveyRecord.teams.length && !surveyRecord.teams.includes(value)) {
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

    entryStore
      .getAllWithSurveyId(entryRecord.surveyId)
      .then((entries) => {
        const configs = flattenConfigs(surveyRecord.configs);
        const matchValue = getHighestMatchValue(entries, configs) + 1;

        const newEntry: Entry = {
          surveyId: entryRecord.surveyId,
          values: configs.map((config) => {
            switch (config.type) {
              case "match":
                return matchValue;
              default:
                return getMetricDefaultValue(config);
            }
          }),
          created: new Date(),
          modified: new Date(),
        };

        return entryStore.add(newEntry);
      })
      .then((id) => {
        location.hash = `/entry/${id}`;
      });
  }

  function countPreviousConfigs(index: number) {
    return flattenConfigs(surveyRecord.configs.slice(0, index)).length;
  }
</script>

<Header title="Entry ({surveyRecord.name})" backLink="survey/{surveyRecord.id}/entries" />

<datalist id="teams-list">
  {#each surveyRecord.teams as team}
    <option value={team} />
  {/each}
</datalist>

<Container padding alignEnd>
  {#each surveyRecord.configs as config, i (config)}
    {#if config.type == "group"}
      <h2>{config.name}</h2>
      {#each config.configs as innerConfig, innerConfigIndex (innerConfig)}
        <MetricEditor
          config={innerConfig}
          bind:value={entryRecord.values[innerConfigIndex + countPreviousConfigs(i)]}
        />
      {/each}
      <div style="width: 100%" />
    {:else}
      <MetricEditor {config} bind:value={entryRecord.values[countPreviousConfigs(i)]} />
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
