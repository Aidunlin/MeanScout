<script lang="ts">
  import { SurveyStore, flattenConfigs, getHighestMatchValue, target, type Entry, type Survey } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyStore: SurveyStore;
  export let survey: Survey;

  $: surveyStore.put(survey);

  function newEntryClicked() {
    const newValue = {
      team: "",
      match: getHighestMatchValue(survey) + 1,
      toggle: false,
      number: 0,
      text: "",
      rating: 0,
      timer: 0,
    };

    const entry: Entry = {
      values: flattenConfigs(survey.configs).map((config) => {
        switch (config.type) {
          case "select":
            return config.values[0];
          default:
            return newValue[config.type];
        }
      }),
      created: new Date(),
      modified: new Date(),
    };

    survey.entries = [entry, ...survey.entries];
  }

  function valueToCSV(value: any) {
    return `${value}`.replaceAll(",", "").replaceAll("\n", ". ").trim();
  }

  function downloadEntries() {
    const csv = [
      flattenConfigs(survey.configs)
        .map((config) => config.name)
        .join(","),
      ...survey.entries.map((entry) => entry.values.map(valueToCSV).join(",")),
    ].join("\n");

    const anchor = document.createElement("a");
    anchor.download = `${survey.name}-${$target}.csv`.replaceAll(" ", "_");
    anchor.href = `data:text/plain;charset=utf-8,${encodeURIComponent(csv)}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function deleteEntry(id: number) {
    survey.entries = survey.entries.filter((_, i) => i != id);
  }
</script>

<Header title={survey.name} backLink={"/surveys"} />

<Container padding noGap>
  <Button iconName="list-ol" title="Entries" />
  <Button
    iconName="gears"
    title="Configs"
    disableTheme
    on:click={() => (location.hash = `/survey/${survey.id}/configs`)}
  />
  <Button
    iconName="ellipsis-vertical"
    title="Options"
    disableTheme
    on:click={() => (location.hash = `/survey/${survey.id}/options`)}
  />
</Container>

<Container column padding>
  <h2>Entries</h2>
  {#each survey.entries as entry, entryId (entry)}
    <Container spaceBetween>
      <Container>
        <Button
          iconName="pen"
          title="Edit entry"
          on:click={() => (location.hash = `/survey/${survey.id}/entry/${entryId}`)}
        />
        {#each flattenConfigs(survey.configs).slice(0, 2) as config, i}
          <span>{config.name}: {entry.values[i]}, </span>
        {/each}
        ...
      </Container>

      <Dialog openButton={{ iconName: "trash", title: "Delete entry" }} onConfirm={() => deleteEntry(entryId)}>
        <span>Delete this entry?</span>
        {#each flattenConfigs(survey.configs).slice(0, 2) as config, i}
          <span>{config.name}: {entry.values[i]}</span>
        {/each}
      </Dialog>
    </Container>
  {/each}
</Container>

<footer>
  <Button iconName="plus" title="New entry" on:click={newEntryClicked} />
  <Button iconName="download" title="Download entries" on:click={downloadEntries} />
</footer>
