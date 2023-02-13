<script lang="ts">
  import { onMount } from "svelte";
  import { ms, locations, type Location } from "./Global.svelte";
  import Metric from "./Metric.svelte";
  import TemplateMenu from "./TemplateMenu.svelte";
  import SurveysMenu from "./SurveysMenu.svelte";

  /** Updates `localStorage` and app theme with `$ms.location` */
  function locationUpdated() {
    localStorage.setItem("location", $ms.location);
    let newTheme = "";
    if ($ms.location.toLowerCase().includes("red")) {
      newTheme = "red";
    } else if ($ms.location.toLowerCase().includes("blue")) {
      newTheme = "blue";
    }
    document.documentElement.style.setProperty(
      "--theme-color",
      `var(--${newTheme})`
    );
  }

  /** Sets `$ms.location` if already set in `localStorage` */
  onMount(() => {
    let storedLocation = localStorage.getItem("location") as Location;
    if (locations.some((location) => location == storedLocation)) {
      $ms.location = storedLocation;
      locationUpdated();
    }
  });
</script>

<div class="flex spaced bg extend-bg" id="menu" class:hide={!$ms.menuVisible}>
  <span class="group">Options</span>
  <Metric
    config={{
      name: "Location",
      type: "select",
      values: Object.values(locations),
    }}
    bind:value={$ms.location}
    on:update={locationUpdated}
  />
  <TemplateMenu />
  <SurveysMenu />
</div>
