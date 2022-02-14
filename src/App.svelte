<script>
  import { ms, exampleTemplate, getMetricDefaultValue } from "./global.js";
  import MenuBar from "./MenuBar.svelte";
  import Menu from "./Menu.svelte";
  import DefaultMetrics from "./DefaultMetrics.svelte";
  import CustomMetrics from "./CustomMetrics.svelte";
  import SurveyBar from "./SurveyBar.svelte";

  /** Parses and loads the current template from `localStorage` (or `exampleTemplate`) */
  function loadTemplate() {
    $ms.currentTemplate = JSON.parse(
      localStorage.getItem("template") ?? JSON.stringify(exampleTemplate)
    );

    $ms.customMetrics = $ms.currentTemplate.metrics.map((metric) => {
      let defaultValue = getMetricDefaultValue(metric.type);

      if (metric.type == "select") {
        defaultValue = metric.values[0];
      }

      return { ...metric, value: defaultValue, default: defaultValue };
    });
  }

  /** Parses and loads the survey backup from `localStorage` */
  function loadBackup() {
    const backup = JSON.parse(localStorage.getItem("backup"));

    if (backup) {
      $ms.team = backup.find((metric) => metric.name == "Team").value;
      $ms.match = backup.find((metric) => metric.name == "Match").value;
      $ms.isAbsent = backup.find((metric) => metric.name == "Absent").value;

      $ms.customMetrics.forEach((metric) => {
        metric.value = backup.find((m) => m.name == metric.name).value;
      });
    }
  }

  /** Registers service worker, loads template and backup */
  function load() {
    if ("serviceWorker" in navigator) {
      try {
        navigator.serviceWorker.register("./sw.js");
      } catch (e) {
        console.log(e);
      }
    }
    
    loadTemplate();
    loadBackup();
    document.body.classList.remove("hide");
  }
</script>

<svelte:window on:load={load} />

<MenuBar />
<Menu />
<DefaultMetrics />
<CustomMetrics />
<SurveyBar />
