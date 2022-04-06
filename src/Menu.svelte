<script>
  import { ms, locations } from "./Global.svelte";
  import Metric from "./Metric.svelte";
  import TemplateMenu from "./TemplateMenu.svelte";
  import SurveysMenu from "./SurveysMenu.svelte";

  /** Updates `localStorage` and app theme with `$ms.location` */
  function locationUpdated() {
    localStorage.setItem("location", $ms.location);
    let newTheme = "";
    if ($ms.location.toLowerCase().includes("red")) newTheme = "red";
    else if ($ms.location.toLowerCase().includes("blue")) newTheme = "blue";
    document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
  }

  /** Sets `$ms.location` if already set in `localStorage` */
  function load() {
    let storedLocation = localStorage.getItem("location");
    if (locations.some((location) => location == storedLocation)) {
      $ms.location = storedLocation;
      locationUpdated();
    }
  }
</script>

<svelte:window on:load={load} />

<div class="flex spaced bg" id="menu" class:hide={!$ms.menuVisible}>
  <span class="group">Options</span>
  <Metric name="Location" type="select" values={locations} bind:value={$ms.location} on:update={locationUpdated} />
  <TemplateMenu />
  <SurveysMenu />
</div>
