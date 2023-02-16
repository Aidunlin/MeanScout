<script lang="ts">
  import {
    currentLocation,
    menuVisible,
    savedSurveys,
    customMetrics,
    teamWhitelist,
    surveyFileType,
  } from "$lib/stores";
  import { downloadSurveys, surveyFileTypes } from "$lib/surveys";
  import { createMetricFromConfig, metricTypes } from "$lib/metrics";
  import { locations, exampleTemplate, type Template } from "$lib/Global.svelte";
  import Metric from "$lib/Metric.svelte";
  import IconButton from "$lib/IconButton.svelte";

  /** Writes the current template to the device's clipboard */
  function copyTemplate() {
    let templateString = JSON.stringify({
      metrics: $customMetrics.map((metric) => metric.config),
      teams: $teamWhitelist,
    });
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(templateString);
      alert("Copied template");
    } else {
      prompt("Copy the template below", templateString);
    }
  }

  /**
   * Sets a new template
   * @param newTemplate The template to use
   */
  function setTemplate(newTemplate: Template) {
    $customMetrics = newTemplate.metrics.map(createMetricFromConfig);
    if (newTemplate.teams) $teamWhitelist = newTemplate.teams;
  }

  /**
   * Parses a stringified template
   * @param templateString A stringified template
   * @returns A template object or an error string
   */
  function parseTemplate(templateString: string): string | Template {
    let result: Template;
    let error = "";
    try {
      result = JSON.parse(templateString) as Template;
    } catch (e) {
      return "Invalid template string";
    }
    if (!Array.isArray(result.teams ?? [])) {
      error += "Template has invalid teams";
    }
    if (!result.metrics) {
      error += "\nTemplate has no metrics";
    } else {
      result.metrics.forEach((metric, i) => {
        if (!metric.name) {
          error += `\nMetric ${i + 1} has no name`;
        }
        if (metric.type == "select" && !Array.isArray(metric.values ?? [])) {
          error += `\nMetric ${metric.name ?? i + 1} has invalid values`;
        }
        if (!metricTypes.includes(metric.type)) {
          error += `\nMetric ${metric.name ?? i + 1} has invalid type`;
        }
      });
    }
    if (error) {
      return error;
    }
    return result;
  }

  /** Prompts the user to enter a new template, or reset to `exampleTemplate` */
  function editTemplate() {
    const newPrompt = prompt("Paste new template (you can also 'reset'):");
    if (newPrompt) {
      if (newPrompt == "reset") {
        setTemplate(exampleTemplate);
      } else {
        let result = parseTemplate(newPrompt);
        if (typeof result == "string") {
          alert(`Could not set template! ${result}`);
        } else {
          setTemplate(result);
        }
      }
    }
  }

  /** Checks if the user wants to download surveys, doing so if they confirm */
  function askDownloadSurveys() {
    if ($savedSurveys && confirm("Confirm download?")) {
      downloadSurveys($surveyFileType, $savedSurveys);
    }
  }

  /** Confirms the user wants to erase saved surveys, doing so if they confirm */
  function eraseSurveys() {
    if (confirm("Confirm erase?")) {
      $savedSurveys = [];
    }
  }
</script>

<div class="flex space-between spaced bg extend-bg">
  <button id="menu-toggle-btn" on:click={() => ($menuVisible = !$menuVisible)}>
    <img class="text-icon" id="logo" src="./logo.png" alt="" />MeanScout
  </button>
  <span id="location-text">{$currentLocation}</span>
</div>

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

  <span class="group">Template</span>
  <IconButton on:click={copyTemplate} icon="copy" text="Copy" />
  <IconButton on:click={editTemplate} icon="pen" text="Edit" />

  <span class="group">Surveys</span>
  <Metric
    config={{ name: "Type", type: "select", values: Object.values(surveyFileTypes) }}
    bind:value={$surveyFileType}
  />
  <IconButton on:click={askDownloadSurveys} icon="download" text="Download" />
  <IconButton on:click={eraseSurveys} icon="erase" text="Erase" />
</div>
