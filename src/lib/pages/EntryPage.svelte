<script lang="ts">
  import {
    flattenConfigs,
    getHighestMatchValue,
    getMetricDefaultValue,
    type DialogDataType,
    type Entry,
    type IDBRecord,
    type Survey,
  } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";
  import MetricEditor from "$lib/components/MetricEditor.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let entryRecord: IDBRecord<Entry>;

  $: idb.transaction("entries", "readwrite").objectStore("entries").put(entryRecord);

  let saveEntryDialog: DialogDataType<{ error: string }> = { data: { error: "" } };

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

  function startNewEntry(entry: Entry) {
    const addRequest = idb.transaction("entries", "readwrite").objectStore("entries").add(entry);
    addRequest.onerror = () => {
      saveEntryDialog.data.error = `Could not create new entry: ${addRequest.error?.message}`;
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) {
        saveEntryDialog.data.error = "Could not create new entry";
        return;
      }

      saveEntryDialog.dialog?.close();
      location.hash = `/entry/${id}`;
    };
  }

  function saveAndStartNewEntry() {
    const error = validateEntry();
    if (error) {
      saveEntryDialog.data.error = `Could not save entry! ${error}`;
      return;
    }

    const flattenedConfigs = flattenConfigs(surveyRecord.configs);

    const request = idb
      .transaction("entries", "readwrite")
      .objectStore("entries")
      .index("surveyId")
      .getAll(entryRecord.surveyId);

    request.onerror = () => {
      const entry: Entry = {
        surveyId: entryRecord.surveyId,
        values: flattenedConfigs.map(getMetricDefaultValue),
        created: new Date(),
        modified: new Date(),
      };
      startNewEntry(entry);
    };

    request.onsuccess = (event) => {
      const entries = request.result as Entry[] | undefined;
      if (entries == undefined) {
        request.onerror && request.onerror(event);
        return;
      }

      const matchValue = getHighestMatchValue(entries, flattenedConfigs) + 1;

      const entry: Entry = {
        surveyId: entryRecord.surveyId,
        values: flattenedConfigs.map((config) => {
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
      startNewEntry(entry);
    };
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
    bind:this={saveEntryDialog.dialog}
    openButton={{ iconName: "floppy-disk", text: "Submit", title: "Submit entry" }}
    onConfirm={saveAndStartNewEntry}
    on:close={() => (saveEntryDialog.data = { error: "" })}
  >
    <span>Save this entry and start a new one?</span>
    {#if saveEntryDialog.data.error}
      <span>{saveEntryDialog.data.error}</span>
    {/if}
  </Dialog>
</footer>
