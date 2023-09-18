<script lang="ts">
  import { getMetricDefaultValue, metricTypes, surveys, type MetricConfig } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";
  import { writable } from "svelte/store";

  export let surveyIndex: number;

  const survey = writable($surveys[surveyIndex]);
  survey.subscribe((survey) => {
    $surveys[surveyIndex] = survey;
    $surveys[surveyIndex].modified = new Date();
  });

  let copySurveyDialog = { text: "" };

  let editConfigDialog: MetricConfig | undefined = undefined;

  function moveConfig(index: number, by: number) {
    const config = $survey.configs.splice(index, 1);
    $survey.configs.splice(index + by, 0, ...config);
    for (let i = 0; i < $survey.entries.length; i++) {
      const value = $survey.entries[i].values.splice(index, 1);
      $survey.entries[i].values.splice(index + by, 0, ...value);
    }
    $survey = $survey;
  }
</script>

<Header title={$survey.name} backLink={"/surveys"} />

<Container padding noGap>
  <Button
    iconName="list-ol"
    title="Entries"
    disableTheme
    on:click={() => (location.hash = `/survey/${surveyIndex}/entries`)}
  />
  <Button iconName="gears" title="Configs" />
  <Button
    iconName="ellipsis-vertical"
    title="Options"
    disableTheme
    on:click={() => (location.hash = `/survey/${surveyIndex}/options`)}
  />
</Container>

<Container column padding>
  <h2>Configs</h2>
  {#each $survey.configs as config, configIndex (config)}
    <Container spaceBetween alignEnd>
      <Container>
        <Dialog
          openButton={{ iconName: "pen", title: "Edit" }}
          onOpen={() => (editConfigDialog = JSON.parse(JSON.stringify(config)))}
          onConfirm={() => {
            if (editConfigDialog) {
              $survey.configs[configIndex] = editConfigDialog;
              for (let i = 0; i < $survey.entries.length; i++) {
                $survey.entries[i].values[configIndex] = getMetricDefaultValue(editConfigDialog);
              }
            }
          }}
          on:close={() => (editConfigDialog = { name: "", type: "toggle" })}
        >
          {#if editConfigDialog}
            <Container column noGap>
              Name
              <input bind:value={editConfigDialog.name} />
            </Container>
            <Container column noGap>
              Type
              <select
                value={editConfigDialog.type}
                on:change={(e) => {
                  if (editConfigDialog == undefined) return;
                  switch (e.currentTarget.value) {
                    case "team":
                    case "match":
                    case "toggle":
                    case "number":
                    case "text":
                    case "rating":
                    case "timer":
                      editConfigDialog = {
                        name: editConfigDialog.name,
                        type: e.currentTarget.value,
                        group: editConfigDialog.group,
                        required: editConfigDialog.required,
                      };
                      break;
                    case "select":
                      editConfigDialog = {
                        name: editConfigDialog.name,
                        type: e.currentTarget.value,
                        group: editConfigDialog.group,
                        required: editConfigDialog.required,
                        values: [],
                      };
                      break;
                  }
                }}
              >
                {#each Object.values(metricTypes) as metricType}
                  <option>{metricType}</option>
                {/each}
              </select>
            </Container>
            <Container column noGap>
              Group
              <input bind:value={editConfigDialog.group} />
            </Container>
            <Container>
              <Button
                iconName={editConfigDialog.required ? "square-check" : "square"}
                iconStyle={editConfigDialog.required ? "solid" : "regular"}
                text="Required"
                on:click={() => {
                  if (editConfigDialog) editConfigDialog.required = !editConfigDialog.required;
                }}
              />
            </Container>
            {#if editConfigDialog.type == "select"}
              <Container column maxWidth>
                Values
                {#each editConfigDialog.values as value, valueIndex}
                  <Container>
                    <input bind:value style="width:200px" />
                    <Button
                      iconName="trash"
                      title="Delete value"
                      on:click={() => {
                        if (editConfigDialog?.type == "select")
                          editConfigDialog.values = editConfigDialog.values.filter((_, i) => i != valueIndex);
                      }}
                    />
                  </Container>
                {/each}
                <Container>
                  <Button
                    iconName="plus"
                    title="New value"
                    on:click={() => {
                      if (editConfigDialog?.type == "select")
                        editConfigDialog.values = [...editConfigDialog.values, ""];
                    }}
                  />
                </Container>
              </Container>
            {:else if editConfigDialog.type == "text"}
              <Container>
                <Button
                  iconStyle={editConfigDialog.long ? "solid" : "regular"}
                  iconName={editConfigDialog.long ? "square-check" : "square"}
                  text="Long"
                  on:click={() => {
                    if (editConfigDialog?.type == "text") editConfigDialog.long = !editConfigDialog.long;
                  }}
                />
              </Container>
              <Container column noGap>
                Tip
                <input bind:value={editConfigDialog.tip} />
              </Container>
            {/if}
          {/if}
        </Dialog>
        <span>{config.name}: {config.type}</span>
      </Container>
      <Container>
        <Button
          iconName="arrow-up"
          title="Move up"
          disabled={configIndex == 0}
          on:click={() => moveConfig(configIndex, -1)}
        />
        <Button
          iconName="arrow-down"
          title="Move down"
          disabled={configIndex == $survey.configs.length - 1}
          on:click={() => moveConfig(configIndex, 1)}
        />

        <Dialog
          openButton={{ iconName: "trash", title: "Delete config" }}
          onConfirm={() => {
            for (let entryIndex = 0; entryIndex < $survey.entries.length; entryIndex++) {
              $survey.entries[entryIndex].values = $survey.entries[entryIndex].values.filter(
                (_, i) => i != configIndex
              );
            }
            $survey.configs = $survey.configs.filter((_, i) => i != configIndex);
          }}
        >
          <span>Delete {$survey.configs[configIndex].name}?</span>
          <span>Entry data corresponding to this config may be deleted!</span>
        </Dialog>
      </Container>
    </Container>
  {/each}
</Container>

<footer>
  <Button
    iconName="plus"
    title="New config"
    on:click={() => {
      $survey.configs = [...$survey.configs, { name: "", type: "toggle" }];
      for (let i = 0; i < $survey.entries.length; i++) {
        $survey.entries[i].values = [...$survey.entries[i].values, false];
      }
    }}
  />

  <Dialog
    openButton={{ iconName: "copy", title: "Copy survey" }}
    onOpen={() => (copySurveyDialog.text = JSON.stringify($survey, undefined, "  "))}
  >
    <span>Select and copy the survey:</span>
    <Container maxWidth>
      <textarea readonly bind:value={copySurveyDialog.text} />
    </Container>
  </Dialog>
</footer>
