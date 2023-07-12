<script lang="ts">
  import {
    getMetricDefaultValue,
    indexes,
    metricTypes,
    surveyPage,
    surveys,
    type DialogData,
    type MetricConfig,
  } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyIndex: number;

  let copySurveyDialog: DialogData & { text: string } = {
    element: undefined,
    text: "",
    show() {
      this.element?.showModal();
    },
    confirm() {},
    close() {
      this.element?.close();
    },
  };

  let editConfigDialog: DialogData & { config: MetricConfig | undefined; configIndex: number | undefined } = {
    element: undefined,
    config: undefined,
    configIndex: undefined,
    show() {
      this.element?.showModal();
    },
    confirm() {
      if (this.config && this.configIndex != undefined) {
        $surveys[surveyIndex].configs[this.configIndex] = this.config;
        this.config = undefined;
        this.configIndex = undefined;
        this.close();
      }
    },
    close() {
      this.element?.close();
    },
  };

  let deleteConfigDialog: DialogData & { config: MetricConfig | undefined; configIndex: number | undefined } = {
    element: undefined,
    config: undefined,
    configIndex: undefined,
    show() {
      this.element?.showModal();
    },
    confirm() {
      if (this.config && this.configIndex != undefined) {
        for (let entryIndex = 0; entryIndex < $surveys[surveyIndex].entries.length; entryIndex++) {
          $surveys[surveyIndex].entries[entryIndex].metrics = $surveys[surveyIndex].entries[entryIndex].metrics.filter(
            (_, i) => i != this.configIndex
          );
        }
        $surveys[surveyIndex].configs = $surveys[surveyIndex].configs.filter((_, i) => i != this.configIndex);
        this.config = undefined;
        this.configIndex = undefined;
        this.close();
      }
    },
    close() {
      this.element?.close();
    },
  };

  function moveConfig(index: number, by: number) {
    let configToMove = $surveys[surveyIndex].configs[index];
    $surveys[surveyIndex].configs.splice(index, 1);
    $surveys[surveyIndex].configs.splice(index + by, 0, configToMove);
    for (let i = 0; i < $surveys[surveyIndex].entries.length; i++) {
      let metricToMove = $surveys[surveyIndex].entries[i].metrics[index];
      $surveys[surveyIndex].entries[i].metrics.splice(index, 1);
      $surveys[surveyIndex].entries[i].metrics.splice(index + by, 0, metricToMove);
    }
    $surveys = $surveys;
  }
</script>

<Header title={$surveys[surveyIndex].name}>
  <Button iconName="arrow-left" title="Back to surveys" on:click={() => ($indexes.survey = undefined)} />
</Header>

<Container padding noGap>
  <Button iconName="list-ol" title="Entries" disableTheme on:click={() => ($surveyPage = "entries")} />
  <Button iconName="gears" title="Configs" />
  <Button iconName="ellipsis-vertical" title="Options" disableTheme on:click={() => ($surveyPage = "options")} />
</Container>

<Container column padding>
  <h2>Configs</h2>
  {#each $surveys[surveyIndex].configs as config, configIndex (config)}
    <Container spaceBetween alignEnd>
      <Container alignEnd>
        <Container column noGap>
          Name
          <input bind:value={config.name} style="width:200px" />
        </Container>
        <Container column noGap>
          Type
          <select
            value={config.type}
            on:change={(e) => {
              if (e.currentTarget.value == "toggle") {
                config = { name: config.name, type: "toggle" };
              } else if (e.currentTarget.value == "number") {
                config = { name: config.name, type: "number" };
              } else if (e.currentTarget.value == "select") {
                config = { name: config.name, type: "select", values: [] };
              } else if (e.currentTarget.value == "text") {
                config = { name: config.name, type: "text" };
              } else if (e.currentTarget.value == "rating") {
                config = { name: config.name, type: "rating" };
              } else if (e.currentTarget.value == "timer") {
                config = { name: config.name, type: "timer" };
              }
              for (let i = 0; i < $surveys[surveyIndex].entries.length; i++) {
                $surveys[surveyIndex].entries[i].metrics[configIndex] = getMetricDefaultValue(config);
              }
            }}
          >
            {#each Object.values(metricTypes) as metricType}
              <option>{metricType}</option>
            {/each}
          </select>
        </Container>
        <Container>
          <Button
            iconName="pen"
            text="Edit"
            on:click={() => {
              editConfigDialog.config = config;
              editConfigDialog.configIndex = configIndex;
              editConfigDialog.show();
            }}
          />
        </Container>
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
          disabled={configIndex == $surveys[surveyIndex].configs.length - 1}
          on:click={() => moveConfig(configIndex, 1)}
        />
        <Button
          iconName="trash"
          title="Delete config"
          on:click={() => {
            deleteConfigDialog.config = config;
            deleteConfigDialog.configIndex = configIndex;
            deleteConfigDialog.show();
          }}
        />
      </Container>
    </Container>
  {/each}

  <dialog bind:this={editConfigDialog.element}>
    {#if editConfigDialog.config && editConfigDialog.configIndex != undefined}
      <span>Edit {editConfigDialog.config.name}:</span>
      <Container column noGap>
        Group
        <input bind:value={editConfigDialog.config.group} />
      </Container>
      {#if editConfigDialog.config.type == "select"}
        <Container column maxWidth>
          Values
          {#each editConfigDialog.config.values as value, valueIndex}
            <Container>
              <input bind:value style="width:200px" />
              <Button
                iconName="trash"
                title="Delete value"
                on:click={() => {
                  if (editConfigDialog.config?.type == "select")
                    editConfigDialog.config.values = editConfigDialog.config.values.filter((_, i) => i != valueIndex);
                }}
              />
            </Container>
          {/each}
          <Container>
            <Button
              iconName="plus"
              title="New value"
              on:click={() => {
                if (editConfigDialog.config?.type == "select")
                  editConfigDialog.config.values = [...editConfigDialog.config.values, ""];
              }}
            />
          </Container>
        </Container>
      {:else if editConfigDialog.config.type == "text"}
        <Container>
          <Button
            iconStyle={editConfigDialog.config.long ? "solid" : "regular"}
            iconName={editConfigDialog.config.long ? "square-check" : "square"}
            text="Long"
            on:click={() => {
              if (editConfigDialog.config?.type == "text") editConfigDialog.config.long = !editConfigDialog.config.long;
            }}
          />
        </Container>
        <Container column noGap>
          Tip
          <input bind:value={editConfigDialog.config.tip} />
        </Container>
      {/if}
      <Container spaceBetween>
        <Button iconName="check" title="Confirm" on:click={() => editConfigDialog.confirm()} />
        <Button iconName="xmark" title="Close" on:click={() => editConfigDialog.close()} />
      </Container>
    {/if}
  </dialog>

  <dialog bind:this={deleteConfigDialog.element}>
    {#if deleteConfigDialog.config && deleteConfigDialog.configIndex != undefined}
      <span>Delete {deleteConfigDialog.config.name}?</span>
      <span>Entry data corresponding to this config may be deleted!</span>
      <Container spaceBetween>
        <Button iconName="check" title="Confirm" on:click={() => deleteConfigDialog.confirm()} />
        <Button iconName="xmark" title="Close" on:click={() => deleteConfigDialog.close()} />
      </Container>
    {/if}
  </dialog>
</Container>

<footer>
  <Button
    iconName="plus"
    title="New config"
    on:click={() => {
      $surveys[surveyIndex].configs = [...$surveys[surveyIndex].configs, { name: "", type: "toggle" }];
      for (let i = 0; i < $surveys[surveyIndex].entries.length; i++) {
        $surveys[surveyIndex].entries[i].metrics = [...$surveys[surveyIndex].entries[i].metrics, false];
      }
    }}
  />

  <Button
    iconName="copy"
    title="Copy survey"
    on:click={() => {
      copySurveyDialog.text = JSON.stringify($surveys[surveyIndex], undefined, "  ");
      copySurveyDialog.show();
    }}
  />
  <dialog bind:this={copySurveyDialog.element}>
    <span>Select and copy the survey:</span>
    <Container maxWidth>
      <textarea readonly bind:value={copySurveyDialog.text} />
    </Container>
    <Button iconName="xmark" title="Close" on:click={() => copySurveyDialog.close()} />
  </dialog>
</footer>
