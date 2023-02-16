<script lang="ts">
  import { currentLocation, menuVisible, locations } from "$lib/Global.svelte";
  import Metric from "$lib/Metric.svelte";
  import TemplateMenu from "./TemplateMenu.svelte";
  import SurveysMenu from "./SurveysMenu.svelte";
</script>

<div class="flex spaced bg extend-bg" id="menu" class:hide={!$menuVisible}>
  <span class="group">Options</span>
  <Metric
    config={{
      name: "Location",
      type: "select",
      values: Object.values(locations),
    }}
    bind:value={$currentLocation}
  />
  <TemplateMenu />
  <SurveysMenu />
</div>
