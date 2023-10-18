<script lang="ts">
  import { metricTypes, type MetricConfig } from "$lib";
  import Button from "./Button.svelte";
  import Container from "./Container.svelte";

  export let configs: MetricConfig[];
  export let config: MetricConfig;
  export let configIndex: number;
  export let disabled = false;

  function moveConfig(by: number) {
    configs.splice(configIndex + by, 0, ...configs.splice(configIndex, 1));
    configs = configs;
  }

  function switchConfigType(to: string) {
    switch (to) {
      case "team":
      case "match":
      case "toggle":
      case "number":
      case "text":
      case "rating":
      case "timer":
        config = {
          name: config.name,
          type: to,
        };
        break;
      case "select":
        config = {
          name: config.name,
          type: to,
          values: [],
        };
        break;
      case "group":
        config = {
          name: config.name,
          type: to,
          configs: [],
        };
        break;
    }
  }

  function duplicateConfig() {
    configs.splice(configIndex, 0, structuredClone(configs[configIndex]));
    configs = configs;
  }

  function deleteConfig() {
    configs = configs.filter((_, i) => i != configIndex);
  }

  function toggleAllowNegative() {
    if (config.type == "number") {
      config.allowNegative = !config.allowNegative;
    }
  }

  function deleteSelectValue(index: number) {
    if (config.type == "select") {
      config.values = config.values.filter((_, i) => i != index);
    }
  }

  function newSelectValue() {
    if (config.type == "select") {
      config.values = [...config.values, ""];
    }
  }

  function toggleLong() {
    if (config.type == "text") {
      config.long = !config.long;
    }
  }

  function newConfig() {
    if (config.type == "group") {
      config.configs = [...config.configs, { name: "", type: "toggle" }];
    }
  }
</script>

<Container column padding>
  <Container>
    <Container column noGap>
      Name
      <input bind:value={config.name} {disabled} />
    </Container>
    <Container column noGap>
      Type
      <select value={config.type} on:change={(e) => switchConfigType(e.currentTarget.value)} {disabled}>
        {#each metricTypes as metricType}
          <option>{metricType}</option>
        {/each}
      </select>
    </Container>
  </Container>

  <Container spaceBetween>
    <Container>
      <Button
        iconName="arrow-up"
        title="Move up"
        disabled={configIndex == 0 || disabled}
        on:click={() => moveConfig(-1)}
      />
      <Button
        iconName="arrow-down"
        title="Move down"
        disabled={configIndex == configs.length - 1 || disabled}
        on:click={() => moveConfig(1)}
      />
      <Button iconName="clone" title="Duplicate config" {disabled} on:click={duplicateConfig} />
    </Container>
    <Button iconName="trash" title="Delete config" {disabled} on:click={deleteConfig} />
  </Container>

  {#if !disabled}
    {#if config.type == "number"}
      <Container column maxWidth padding>
        <Container>
          <Button
            iconStyle={config.allowNegative ? "solid" : "regular"}
            iconName={config.allowNegative ? "square-check" : "square"}
            text="Allow Negative"
            on:click={toggleAllowNegative}
          />
        </Container>
      </Container>
    {:else if config.type == "select"}
      <Container column maxWidth padding>
        {config.name} Values
        <Container column padding>
          {#each config.values as value, i}
            <Container>
              <input bind:value style="width:200px" />
              <Button iconName="trash" title="Delete value" on:click={() => deleteSelectValue(i)} />
            </Container>
          {/each}
        </Container>
        <Container>
          <Button iconName="plus" title="New value" on:click={newSelectValue} />
        </Container>
      </Container>
    {:else if config.type == "text"}
      <Container column maxWidth padding>
        <Container alignEnd>
          <Container column noGap>
            Tip
            <input bind:value={config.tip} />
          </Container>
          <Button
            iconStyle={config.long ? "solid" : "regular"}
            iconName={config.long ? "square-check" : "square"}
            text="Long"
            on:click={toggleLong}
          />
        </Container>
      </Container>
    {:else if config.type == "group"}
      <Container column maxWidth padding>
        {config.name} Configs
        {#each config.configs as innerConfig, innerConfigIndex (innerConfig)}
          <svelte:self bind:configs={config.configs} bind:config={innerConfig} configIndex={innerConfigIndex} />
        {/each}
        <Container>
          <Button iconName="plus" title="New config" on:click={newConfig} />
        </Container>
      </Container>
    {/if}
  {/if}
</Container>
