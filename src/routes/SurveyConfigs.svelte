<script lang="ts">
  import { getMetricDefaultValue, metricTypes, routes, surveys, type MetricConfig } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  export let surveyIndex: number;

  let copySurveyDialog = { text: "" };

  let editConfigDialog: MetricConfig | undefined = undefined;

  function moveConfig(index: number, by: number) {
    let configToMove = $surveys[surveyIndex].configs[index];
    $surveys[surveyIndex].configs.splice(index, 1);
    $surveys[surveyIndex].configs.splice(index + by, 0, configToMove);
    for (let i = 0; i < $surveys[surveyIndex].entries.length; i++) {
      let metricToMove = $surveys[surveyIndex].entries[i][index];
      $surveys[surveyIndex].entries[i].splice(index, 1);
      $surveys[surveyIndex].entries[i].splice(index + by, 0, metricToMove);
    }
    $surveys = $surveys;
  }
</script>

<Header title={$surveys[surveyIndex].name}>
  <Button iconName="arrow-left" title="Back to surveys" on:click={() => ($routes = ["surveys"])} />
</Header>

<Container padding noGap>
  <Button iconName="list-ol" title="Entries" disableTheme on:click={() => ($routes[1] = "entries")} />
  <Button iconName="gears" title="Configs" />
  <Button iconName="ellipsis-vertical" title="Options" disableTheme on:click={() => ($routes[1] = "options")} />
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
              switch (e.currentTarget.value) {
                case "team":
                  config = { name: config.name, type: "team" };
                  break;
                case "match":
                  config = { name: config.name, type: "match" };
                  break;
                case "toggle":
                  config = { name: config.name, type: "toggle" };
                  break;
                case "number":
                  config = { name: config.name, type: "number" };
                  break;
                case "select":
                  config = { name: config.name, type: "select", values: [] };
                  break;
                case "text":
                  config = { name: config.name, type: "text" };
                  break;
                case "rating":
                  config = { name: config.name, type: "rating" };
                  break;
                case "timer":
                  config = { name: config.name, type: "timer" };
                  break;
              }
              for (let i = 0; i < $surveys[surveyIndex].entries.length; i++) {
                $surveys[surveyIndex].entries[i][configIndex] = getMetricDefaultValue(config);
              }
            }}
          >
            {#each Object.values(metricTypes) as metricType}
              <option>{metricType}</option>
            {/each}
          </select>
        </Container>
        <Container>
          <Dialog
            openButton={{ iconName: "pen", text: "Edit" }}
            onOpen={() => (editConfigDialog = JSON.parse(JSON.stringify(config)))}
            onConfirm={() => {
              if (editConfigDialog) {
                $surveys[surveyIndex].configs[configIndex] = editConfigDialog;
              }
              return true;
            }}
            on:close={() => (editConfigDialog = { name: "", type: "toggle" })}
          >
            {#if editConfigDialog}
              <span>Edit {editConfigDialog.name}:</span>
              <Container column noGap>
                Group
                <input bind:value={editConfigDialog.group} />
              </Container>
              <Container column noGap>
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

        <Dialog
          openButton={{ iconName: "trash", title: "Delete config" }}
          onConfirm={() => {
            for (let entryIndex = 0; entryIndex < $surveys[surveyIndex].entries.length; entryIndex++) {
              $surveys[surveyIndex].entries[entryIndex] = $surveys[surveyIndex].entries[entryIndex].filter(
                (_, i) => i != configIndex
              );
            }
            $surveys[surveyIndex].configs = $surveys[surveyIndex].configs.filter((_, i) => i != configIndex);
            return true;
          }}
        >
          <span>Delete {$surveys[surveyIndex].configs[configIndex].name}?</span>
          <span>Entry data corresponding to this config may be deleted!</span></Dialog
        >
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
        $surveys[surveyIndex].entries[i] = [...$surveys[surveyIndex].entries[i], false];
      }
    }}
  />

  <Dialog
    openButton={{ iconName: "copy", title: "Copy survey" }}
    onOpen={() => (copySurveyDialog.text = JSON.stringify($surveys[surveyIndex], undefined, "  "))}
  >
    <span>Select and copy the survey:</span>
    <Container maxWidth>
      <textarea readonly bind:value={copySurveyDialog.text} />
    </Container>
  </Dialog>
</footer>
