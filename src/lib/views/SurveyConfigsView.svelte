<script lang="ts">
  import { SurveyStore, metricTypes, type MetricConfig, type Survey } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyStore: SurveyStore;
  export let survey: Survey;

  $: surveyStore.put(survey);

  let copySurveyDialog = { text: "" };

  let editConfigDialog: MetricConfig | undefined = undefined;

  function moveConfig(index: number, by: number) {
    const config = survey.configs.splice(index, 1);
    survey.configs.splice(index + by, 0, ...config);
    survey = survey;
  }

  function applyConfigEdits(index: number) {
    if (editConfigDialog) {
      survey.configs[index] = editConfigDialog;
    }
  }

  function onConfigTypeChanged(value: string) {
    if (editConfigDialog == undefined) return;
    switch (value) {
      case "team":
      case "match":
      case "toggle":
      case "number":
      case "text":
      case "rating":
      case "timer":
        editConfigDialog = {
          name: editConfigDialog.name,
          type: value,
        };
        break;
      case "select":
        editConfigDialog = {
          name: editConfigDialog.name,
          type: value,
          values: [],
        };
        break;
      case "group":
        editConfigDialog = {
          name: editConfigDialog.name,
          type: value,
          configs: [],
        };
        break;
    }
  }

  function deleteConfig(index: number) {
    survey.configs = survey.configs.filter((_, i) => i != index);
  }

  function newConfig() {
    survey.configs = [...survey.configs, { name: "", type: "toggle" }];
  }

  function surveyToString() {
    const exportableSurvey = {
      name: survey.name,
      configs: survey.configs,
      teams: survey.teams,
      created: survey.created,
      modified: survey.modified,
    };
    return JSON.stringify(exportableSurvey, undefined, "  ");
  }
</script>

<Header title={survey.name} backLink={"/surveys"} />

<Container padding noGap>
  <Button
    iconName="list-ol"
    title="Entries"
    disableTheme
    on:click={() => (location.hash = `/survey/${survey.id}/entries`)}
  />
  <Button iconName="gears" title="Configs" />
  <Button
    iconName="ellipsis-vertical"
    title="Options"
    disableTheme
    on:click={() => (location.hash = `/survey/${survey.id}/options`)}
  />
</Container>

<Container column padding>
  <h2>Configs</h2>
  {#if survey.entries.length}
    <span>Cannot modify configs with entries present!</span>
  {/if}
  {#each survey.configs as config, configIndex (config)}
    <Container spaceBetween alignEnd padding>
      <Container>
        <Dialog
          openButton={{ iconName: "pen", title: "Edit", disabled: survey.entries.length != 0 }}
          onOpen={() => (editConfigDialog = JSON.parse(JSON.stringify(config)))}
          onConfirm={() => applyConfigEdits(configIndex)}
          on:close={() => (editConfigDialog = { name: "", type: "toggle" })}
        >
          {#if editConfigDialog}
            <Container column noGap>
              Name
              <input bind:value={editConfigDialog.name} />
            </Container>
            <Container column noGap>
              Type
              <select value={editConfigDialog.type} on:change={(e) => onConfigTypeChanged(e.currentTarget.value)}>
                {#each Object.values(metricTypes) as metricType}
                  <option>{metricType}</option>
                {/each}
              </select>
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
                        if (editConfigDialog?.type == "select") {
                          editConfigDialog.values = editConfigDialog.values.filter((_, i) => i != valueIndex);
                        }
                      }}
                    />
                  </Container>
                {/each}
                <Container>
                  <Button
                    iconName="plus"
                    title="New value"
                    on:click={() => {
                      if (editConfigDialog?.type == "select") {
                        editConfigDialog.values = [...editConfigDialog.values, ""];
                      }
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
                    if (editConfigDialog?.type == "text") {
                      editConfigDialog.long = !editConfigDialog.long;
                    }
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
          disabled={configIndex == 0 || survey.entries.length != 0}
          on:click={() => moveConfig(configIndex, -1)}
        />
        <Button
          iconName="arrow-down"
          title="Move down"
          disabled={configIndex == survey.configs.length - 1 || survey.entries.length != 0}
          on:click={() => moveConfig(configIndex, 1)}
        />

        <Dialog
          openButton={{ iconName: "trash", title: "Delete config", disabled: survey.entries.length != 0 }}
          onConfirm={() => deleteConfig(configIndex)}
        >
          <span>Delete {survey.configs[configIndex].name}?</span>
          <span>Entry data corresponding to this config may be deleted!</span>
        </Dialog>
      </Container>
      {#if config.type == "group" && survey.entries.length == 0}
        <Container column maxWidth padding>
          Configs
          {#each config.configs as innerConfig, innerConfigIndex (innerConfig)}
            <Container alignEnd spaceBetween>
              <Container alignEnd>
                <Container column noGap>
                  Name
                  <input bind:value={innerConfig.name} />
                </Container>
                <Container column noGap>
                  Type
                  <select
                    value={innerConfig.type}
                    on:change={(e) => {
                      const value = e.currentTarget.value;
                      switch (value) {
                        case "team":
                        case "match":
                        case "toggle":
                        case "number":
                        case "text":
                        case "rating":
                        case "timer":
                          innerConfig = {
                            name: innerConfig.name,
                            type: value,
                          };
                          break;
                        case "select":
                          innerConfig = {
                            name: innerConfig.name,
                            type: value,
                            values: [],
                          };
                          break;
                      }
                    }}
                  >
                    {#each ["team", "match", "toggle", "number", "select", "text", "rating", "timer"] as metricType}
                      <option>{metricType}</option>
                    {/each}
                  </select>
                </Container>
                {#if innerConfig.type == "select"}
                  <Container column maxWidth>
                    Values
                    {#each innerConfig.values as value, valueIndex}
                      <Container>
                        <input bind:value style="width:200px" />
                        <Button
                          iconName="trash"
                          title="Delete value"
                          on:click={() => {
                            if (innerConfig?.type == "select") {
                              innerConfig.values = innerConfig.values.filter((_, i) => i != valueIndex);
                            }
                          }}
                        />
                      </Container>
                    {/each}
                    <Container>
                      <Button
                        iconName="plus"
                        title="New value"
                        on:click={() => {
                          if (innerConfig?.type == "select") {
                            innerConfig.values = [...innerConfig.values, ""];
                          }
                        }}
                      />
                    </Container>
                  </Container>
                {:else if innerConfig.type == "text"}
                  <Container>
                    <Button
                      iconStyle={innerConfig.long ? "solid" : "regular"}
                      iconName={innerConfig.long ? "square-check" : "square"}
                      text="Long"
                      on:click={() => {
                        if (innerConfig?.type == "text") {
                          innerConfig.long = !innerConfig.long;
                        }
                      }}
                    />
                  </Container>
                  <Container column noGap>
                    Tip
                    <input bind:value={innerConfig.tip} />
                  </Container>
                {/if}
              </Container>
              <Container alignEnd>
                <Button
                  iconName="arrow-up"
                  title="Move up"
                  disabled={innerConfigIndex == 0}
                  on:click={() => {
                    if (config.type == "group") {
                      const configToMove = config.configs.splice(innerConfigIndex, 1);
                      config.configs.splice(innerConfigIndex - 1, 0, ...configToMove);
                      config = config;
                    }
                  }}
                />
                <Button
                  iconName="arrow-down"
                  title="Move down"
                  disabled={innerConfigIndex == config.configs.length - 1}
                  on:click={() => {
                    if (config.type == "group") {
                      const configToMove = config.configs.splice(innerConfigIndex, 1);
                      config.configs.splice(innerConfigIndex + 1, 0, ...configToMove);
                      config = config;
                    }
                  }}
                />

                <Dialog
                  openButton={{ iconName: "trash", title: "Delete config" }}
                  onConfirm={() => {
                    if (config.type == "group") {
                      config.configs = config.configs.filter((_, i) => i != innerConfigIndex);
                    }
                  }}
                >
                  <span>Delete {innerConfig.name}?</span>
                  <span>Entry data corresponding to this config may be deleted!</span>
                </Dialog>
              </Container>
            </Container>
          {/each}
          <Container>
            <Button
              iconName="plus"
              title="New config"
              on:click={() => {
                if (config.type == "group") {
                  config.configs = [...config.configs, { name: "", type: "toggle" }];
                }
              }}
            />
          </Container>
        </Container>
      {/if}
    </Container>
  {/each}
</Container>

<footer>
  <Button iconName="plus" title="New config" disabled={survey.entries.length != 0} on:click={newConfig} />

  <Dialog
    openButton={{ iconName: "copy", title: "Copy survey" }}
    onOpen={() => (copySurveyDialog = { text: surveyToString() })}
  >
    <span>Select and copy the survey:</span>
    <Container maxWidth>
      <textarea readonly bind:value={copySurveyDialog.text} />
    </Container>
  </Dialog>
</footer>
