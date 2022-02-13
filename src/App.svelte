<script>
  import { msData, exampleTemplate, getDefaultValue } from "./stores.js";
  import MenuBar from "./MenuBar.svelte";
  import Menu from "./Menu.svelte";
  import DefaultMetrics from "./DefaultMetrics.svelte";
  import CustomMetrics from "./CustomMetrics.svelte";
  import SurveyBar from "./SurveyBar.svelte";

  function loadTemplate() {
    $msData.currentTemplate = JSON.parse(
      localStorage.template ?? JSON.stringify(exampleTemplate)
    );

    $msData.customMetrics = $msData.currentTemplate.metrics.map((metric) => {
      let defaultValue = getDefaultValue(metric.type);

      if (metric.type == "select") {
        defaultValue = metric.values[0];
      }

      return { ...metric, value: defaultValue, default: defaultValue };
    });
  }

  function loadBackup() {
    const backup = JSON.parse(localStorage.backup);
    $msData.team = backup.find((metric) => metric.name == "Team").value;
    $msData.match = backup.find((metric) => metric.name == "Match").value;
    $msData.isAbsent = backup.find((metric) => metric.name == "Absent").value;

    $msData.customMetrics.forEach((metric) => {
      metric.value = backup.find((m) => m.name == metric.name).value;
    });
  }

  function load() {
    document.body.classList.remove("hide");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js");
    }

    loadTemplate();

    if (localStorage.backup) {
      loadBackup();
    }
  }
</script>

<svelte:window on:load={load} />

<MenuBar />
<Menu />
<DefaultMetrics />
<CustomMetrics />
<SurveyBar />
