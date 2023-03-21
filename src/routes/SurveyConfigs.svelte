<script lang="ts">
  import { metricTypes, surveys } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";

  export let surveyIndex: number;

  let dialogCopySurvey = { text: "", visible: false };

  function moveConfig(index: number, by: number) {
    let configToMove = $surveys[surveyIndex].configs[index];
    $surveys[surveyIndex].configs.splice(index, 1);
    $surveys[surveyIndex].configs.splice(index + by, 0, configToMove);
    $surveys = $surveys;
  }
</script>

<Dialog title="Select and copy the survey:" bind:visible={dialogCopySurvey.visible}>
  <Container maxWidth>
    <textarea readonly bind:value={dialogCopySurvey.text} />
  </Container>
</Dialog>

<Container column padding>
  <h2>Configs</h2>
  {#each $surveys[surveyIndex].configs as config, configIndex (config)}
    <Container padding spaceBetween alignEnd>
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
            }}
          >
            {#each Object.values(metricTypes) as metricType}
              <option>{metricType}</option>
            {/each}
          </select>
        </Container>
        {#if config.type == "select"}
          <Container column maxWidth>
            Values
            {#each config.values as value, valueIndex}
              <Container>
                <input bind:value style="width:200px" />
                <Button
                  iconName="trash"
                  title="Delete value"
                  on:click={() => {
                    if ("values" in config) config.values = config.values.filter((_, i) => i != valueIndex);
                  }}
                />
              </Container>
            {/each}
            <Container>
              <Button
                iconName="plus"
                title="New value"
                on:click={() => {
                  if ("values" in config) config.values = [...config.values, ""];
                }}
              />
            </Container>
          </Container>
        {:else if config.type == "text"}
          <Container column noGap>
            Tip
            <input bind:value={config.tip} />
          </Container>
        {/if}
      </Container>
      <Container>
        {#if configIndex > 0}
          <Button iconName="arrow-up" title="Move up" on:click={() => moveConfig(configIndex, -1)} />
        {/if}
        {#if configIndex < $surveys[surveyIndex].configs.length - 1}
          <Button iconName="arrow-down" title="Move down" on:click={() => moveConfig(configIndex, 1)} />
        {/if}
        <Button
          iconName="trash"
          title="Delete config"
          on:click={() => {
            $surveys[surveyIndex].configs = $surveys[surveyIndex].configs.filter((_, i) => i != configIndex);
          }}
        />
      </Container>
    </Container>
  {/each}
</Container>

<footer>
  <Button
    iconName="plus"
    title="New config"
    on:click={() => ($surveys[surveyIndex].configs = [...$surveys[surveyIndex].configs, { name: "", type: "toggle" }])}
  />
  <Button
    iconName="copy"
    title="Copy survey"
    on:click={() =>
      (dialogCopySurvey = {
        text: JSON.stringify($surveys[surveyIndex], undefined, "  "),
        visible: true,
      })}
  />
</footer>
