<script lang="ts">
  import {
    flattenConfigs,
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
  export let draftRecord: IDBRecord<Entry>;

  $: idb.transaction("drafts", "readwrite").objectStore("drafts").put(draftRecord);

  let submitDraftDialog: DialogDataType<{ error: string }> = { data: { error: "" } };

  function validateDraft() {
    let error = "";
    const configs = flattenConfigs(surveyRecord.configs);

    draftRecord.values.forEach((value, i) => {
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

  function startNewDraft() {
    const flattenedConfigs = flattenConfigs(surveyRecord.configs);

    const draft: Entry = {
      surveyId: draftRecord.surveyId,
      values: flattenedConfigs.map((config, i) => {
        switch (config.type) {
          case "match":
            return (draftRecord.values[i] ?? 0) + 1;
          default:
            return getMetricDefaultValue(config);
        }
      }),
      created: new Date(),
      modified: new Date(),
    };

    const addRequest = idb.transaction("drafts", "readwrite").objectStore("drafts").add(draft);
    addRequest.onerror = () => {
      submitDraftDialog.data.error = `Could not create new draft: ${addRequest.error?.message}`;
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) {
        submitDraftDialog.data.error = "Could not create new draft";
        return;
      }

      submitDraftDialog.dialog?.close();
      location.hash = `/draft/${id}`;
    };
  }

  function submitAndStartNewDraft() {
    const error = validateDraft();
    if (error) {
      submitDraftDialog.data.error = `Could not submit draft: ${error}`;
      return;
    }

    const moveTransaction = idb.transaction(["drafts", "entries"], "readwrite");
    moveTransaction.onabort = () => {
      submitDraftDialog.data.error = `Could not submit draft: ${moveTransaction.error?.message}`;
    };

    const entryRecord = structuredClone(draftRecord) as Entry & { id?: number };
    delete entryRecord.id;
    moveTransaction.objectStore("entries").add(entryRecord);
    moveTransaction.objectStore("drafts").delete(draftRecord.id);

    moveTransaction.oncomplete = () => startNewDraft();
  }

  function countPreviousConfigs(index: number) {
    return flattenConfigs(surveyRecord.configs.slice(0, index)).length;
  }
</script>

<Header title="Draft ({surveyRecord.name})" backLink="survey/{surveyRecord.id}/entries" />

<datalist id="teams-list">
  {#each surveyRecord.teams as team}
    <option value={team} />
  {/each}
</datalist>

<Container padding alignEnd>
  {#each surveyRecord.configs as config, i (config)}
    {@const previousConfigs = countPreviousConfigs(i)}
    {#if config.type == "group"}
      <h2>{config.name}</h2>
      <Container alignEnd maxWidth>
        {#each config.configs as innerConfig, innerConfigIndex (innerConfig)}
          <MetricEditor config={innerConfig} bind:value={draftRecord.values[previousConfigs + innerConfigIndex]} />
        {/each}
      </Container>
    {:else}
      <MetricEditor {config} bind:value={draftRecord.values[previousConfigs]} />
    {/if}
  {/each}
</Container>

<footer>
  <Dialog
    bind:this={submitDraftDialog.dialog}
    openButton={{ iconName: "floppy-disk", text: "Submit", title: "Submit draft" }}
    onConfirm={submitAndStartNewDraft}
    on:close={() => (submitDraftDialog.data = { error: "" })}
  >
    <span>Submit this draft and start a new one?</span>
    {#if submitDraftDialog.data.error}
      <span>{submitDraftDialog.data.error}</span>
    {/if}
  </Dialog>
</footer>
