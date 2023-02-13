<script lang="ts">
  import { onMount } from "svelte";
  import {
    ms,
    exampleTemplate,
    getMetricDefaultValue,
    type Template,
  } from "$lib/Global.svelte";
  import MenuBar from "./MenuBar.svelte";
  import Menu from "./Menu.svelte";
  import DefaultMetrics from "./DefaultMetrics.svelte";
  import CustomMetrics from "./CustomMetrics.svelte";
  import SurveyBar from "./SurveyBar.svelte";

  /** Parses and loads the current template from `localStorage` (or `exampleTemplate`) */
  function loadTemplate() {
    let template: Template = JSON.parse(
      localStorage.getItem("template") ?? JSON.stringify(exampleTemplate)
    );
    if (template.teams) {
      $ms.teams = template.teams;
    }
    $ms.metrics = template.metrics.map((config) => {
      let value = getMetricDefaultValue(config);
      return { config, value };
    });
  }

  /** Parses and loads the survey backup from `localStorage` */
  function loadBackup() {
    const backup = JSON.parse(localStorage.getItem("backup") ?? "[]") as {
      name: string;
      value: any;
    }[];
    if (backup.length) {
      $ms.team = backup.find((metric) => metric.name == "Team")?.value;
      $ms.match = backup.find((metric) => metric.name == "Match")?.value;
      $ms.isAbsent = backup.find((metric) => metric.name == "Absent")?.value;
      $ms.metrics.forEach((metric, i) => (metric.value = backup[i + 3].value));
    }
  }

  /** Loads template and backup */
  onMount(() => {
    loadTemplate();
    loadBackup();
    document.body.classList.remove("hide");
  });
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<MenuBar />
<Menu />
<DefaultMetrics />
<CustomMetrics />
<SurveyBar />
