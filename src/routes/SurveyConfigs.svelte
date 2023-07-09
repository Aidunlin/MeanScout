<script lang="ts">
  import { metricTypes, surveys, type MetricConfig, getMetricDefaultValue } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";

  export let surveyIndex: number;

  let dialogCopySurvey = { text: "", visible: false };

  let dialogEditConfig: { config: MetricConfig | undefined; configIndex: number | undefined; visible: boolean } = {
    config: undefined,
    configIndex: undefined,
    visible: false,
  };

  let dialogDeleteConfig: { config: MetricConfig | undefined; configIndex: number | undefined; visible: boolean } = {
    config: undefined,
    configIndex: undefined,
    visible: false,
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

<Dialog title="Select and copy the survey:" bind:visible={dialogCopySurvey.visible}>
  <Container maxWidth>
    <textarea readonly bind:value={dialogCopySurvey.text} />
  </Container>
</Dialog>

{#if dialogEditConfig.config && dialogEditConfig.configIndex != undefined}
  <Dialog title="Edit {dialogEditConfig.config.name}:" bind:visible={dialogEditConfig.visible}>
    <Container column noGap>
      Group
      <input bind:value={dialogEditConfig.config.group} />
    </Container>
    {#if dialogEditConfig.config.type == "select"}
      <Container column maxWidth>
        Values
        {#each dialogEditConfig.config.values as value, valueIndex}
          <Container>
            <input bind:value style="width:200px" />
            <Button
              iconName="trash"
              title="Delete value"
              on:click={() => {
                if (dialogEditConfig.config?.type == "select")
                  dialogEditConfig.config.values = dialogEditConfig.config.values.filter((_, i) => i != valueIndex);
              }}
            />
          </Container>
        {/each}
        <Container>
          <Button
            iconName="plus"
            title="New value"
            on:click={() => {
              if (dialogEditConfig.config?.type == "select")
                dialogEditConfig.config.values = [...dialogEditConfig.config.values, ""];
            }}
          />
        </Container>
      </Container>
    {:else if dialogEditConfig.config.type == "text"}
      <Container>
        <Button
          iconStyle={dialogEditConfig.config.long ? "solid" : "regular"}
          iconName={dialogEditConfig.config.long ? "square-check" : "square"}
          text="Long"
          on:click={() => {
            if (dialogEditConfig.config?.type == "text") dialogEditConfig.config.long = !dialogEditConfig.config.long;
          }}
        />
      </Container>
      <Container column noGap>
        Tip
        <input bind:value={dialogEditConfig.config.tip} />
      </Container>
    {/if}

    <Button
      slot="buttons"
      iconName="check"
      title="Confirm"
      on:click={() => {
        if (dialogEditConfig.config && dialogEditConfig.configIndex != undefined) {
          $surveys[surveyIndex].configs[dialogEditConfig.configIndex] = dialogEditConfig.config;
          dialogEditConfig = { config: undefined, configIndex: undefined, visible: false };
        }
      }}
    />
  </Dialog>
{/if}

{#if dialogDeleteConfig.config && dialogDeleteConfig.configIndex != undefined}
  <Dialog title="Delete {dialogDeleteConfig.config.name}?" bind:visible={dialogDeleteConfig.visible}>
    <span>Entry data corresponding to this config may be deleted!</span>
    <Button
      slot="buttons"
      iconName="check"
      title="Confirm"
      on:click={() => {
        if (dialogDeleteConfig.config && dialogDeleteConfig.configIndex != undefined) {
          for (let entryIndex = 0; entryIndex < $surveys[surveyIndex].entries.length; entryIndex++) {
            $surveys[surveyIndex].entries[entryIndex].metrics = $surveys[surveyIndex].entries[
              entryIndex
            ].metrics.filter((_, i) => i != dialogDeleteConfig.configIndex);
          }
          $surveys[surveyIndex].configs = $surveys[surveyIndex].configs.filter(
            (_, i) => i != dialogDeleteConfig.configIndex
          );
          dialogDeleteConfig = { config: undefined, configIndex: undefined, visible: false };
        }
      }}
    />
  </Dialog>
{/if}

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
            on:click={() => (dialogEditConfig = { config, configIndex, visible: true })}
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
          on:click={() => (dialogDeleteConfig = { config, configIndex, visible: true })}
        />
      </Container>
    </Container>
  {/each}
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
      dialogCopySurvey = {
        text: JSON.stringify($surveys[surveyIndex], undefined, "  "),
        visible: true,
      };
    }}
  />
</footer>
